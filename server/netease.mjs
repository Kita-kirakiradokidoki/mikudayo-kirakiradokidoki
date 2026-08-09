/**
 * NetEase Cloud Music API client.
 *
 * Wraps the `NeteaseCloudMusicApi` npm package with a TTL cache layer
 * and the same error-handling pattern as `server/steam.mjs`.
 *
 * This module runs on the server only: `NETEASE_COOKIE` is a secret and
 * the NetEase API is not CORS-friendly for browsers.
 *
 * Docs: https://github.com/Binaryify/NeteaseCloudMusicApi
 */

import neteasePkg from 'NeteaseCloudMusicApi'

const {
  search,
  song_url_v1: song_url,
  playlist_detail,
  user_record,
  lyric_new: lyric,
} = neteasePkg

const REQUEST_TIMEOUT = 8_000

export class NeteaseError extends Error {
  /**
   * @param {string} message
   * @param {number} [status] HTTP status to surface to the browser
   * @param {string} [code] stable machine-readable code
   */
  constructor(message, status = 502, code = 'netease_error') {
    super(message)
    this.name = 'NeteaseError'
    this.status = status
    this.code = code
  }
}

// ── cookie ────────────────────────────────────────────────

function cookie() {
  return process.env.NETEASE_COOKIE?.trim() ?? ''
}

/** Whether the server is able to pass credentials to NetEase. */
export function isNeteaseConfigured() {
  return Boolean(cookie())
}

// ── request helper ────────────────────────────────────────

/**
 * Call a NeteaseCloudMusicApi function with timeout and cookie.
 *
 * The library accepts `(query, requestHandler)` where the second arg is a
 * callback-mimicking function that receives `(key, value)`.  The `cookie`
 * property is sprinkled onto the query object by convention (it is read
 * from `options.cookie` when present).
 *
 * @param {Function} fn  the NeteaseCloudMusicApi function
 * @param {object} query  query parameters for the API call
 * @returns {Promise<any>}  `result.body`
 */
async function request(fn, query = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const result = await fn(
      { cookie: cookie(), ...query },
      // The library's "request handler" signature.  We only care about the
      // cancelToken so we can wire up our AbortController.
      (key, value) => {
        if (key === 'cancelToken' && typeof value?.cancel === 'function') {
          controller.signal.addEventListener('abort', () => value.cancel('timeout'))
        }
      },
    )

    if (result.body?.code !== 200 && result.body?.code !== undefined) {
      throw new NeteaseError(
        result.body.message ?? `NetEase API returned code ${result.body.code}`,
        502,
        `netease_code_${result.body.code}`,
      )
    }
    return result.body
  } catch (err) {
    if (err instanceof NeteaseError) throw err
    if (err.name === 'AbortError' || err?.message === 'timeout') {
      throw new NeteaseError('NetEase API request timed out', 504, 'timeout')
    }
    throw new NeteaseError(
      err instanceof Error ? err.message : 'NetEase API request failed',
      502,
      'network_error',
    )
  } finally {
    clearTimeout(timer)
  }
}

// ── TTL cache (same pattern as server/steam.mjs) ──────────

/**
 * TTL cache that also de-duplicates concurrent misses for the same key.
 *
 * @template T
 * @param {number} ttl  cache lifetime in ms
 */
function createCache(ttl) {
  /** @type {Map<string, { value: *, expires: number }>} */
  const entries = new Map()
  /** @type {Map<string, Promise<*>>} */
  const inflight = new Map()

  return {
    /**
     * @param {string} key
     * @param {() => Promise<*>} produce
     * @param {number} [minAge]  ignore cached entries younger than this many ms
     * @returns {Promise<{ value: *, cached: boolean, age: number }>}
     */
    async get(key, produce, minAge) {
      const now = Date.now()
      const hit = entries.get(key)
      if (hit) {
        const age = ttl - (hit.expires - now)
        const stale = minAge === undefined ? hit.expires <= now : age >= minAge
        if (!stale) return { value: hit.value, cached: true, age }
      }

      const pending = inflight.get(key)
      if (pending) return { value: await pending, cached: true, age: 0 }

      const task = produce()
        .then((value) => {
          entries.set(key, { value, expires: Date.now() + ttl })
          return value
        })
        .finally(() => inflight.delete(key))

      inflight.set(key, task)
      return { value: await task, cached: false, age: 0 }
    },
  }
}

const searchCache = createCache(60_000)        // 搜索词缓存 60s
const songUrlCache = createCache(15_000)       // 播放 URL 短期缓存
const playlistCache = createCache(300_000)     // 歌单内容变更少
const recordCache = createCache(60_000)        // 听歌记录 60s
const lyricCache = createCache(600_000)        // 歌词很少变

// ── normalisers ───────────────────────────────────────────

function artistName(ar) {
  if (!ar || !Array.isArray(ar)) return 'Unknown'
  return ar.map((a) => a.name ?? '').filter(Boolean).join(' / ') || 'Unknown'
}

function normaliseSong(raw) {
  const id = raw.id ?? 0
  return {
    id,
    name: raw.name ?? 'Unknown',
    artist: artistName(raw.ar ?? raw.artists),
    album: raw.al?.name ?? raw.album?.name ?? '',
    cover: raw.al?.picUrl ?? raw.album?.picUrl ?? raw.cover ?? '',
    duration: raw.dt ?? raw.duration ?? 0,
    url: raw.url ?? null,
  }
}

// ── exported API ──────────────────────────────────────────

/**
 * Search for songs.
 *
 * @param {string} kw  keyword
 * @param {number} [limit=20]
 * @returns {Promise<Array<{id:number,name:string,artist:string,album:string,cover:string,duration:number,url:null}>>}
 */
export async function searchSong(kw, limit = 20) {
  const { value } = await searchCache.get(`search:${kw}:${limit}`, async () => {
    const data = await request(search, { keywords: kw, limit, type: 1 })
    const songs = data?.result?.songs ?? []
    return songs.map(normaliseSong)
  })
  return value
}

/**
 * Get a playable song URL.
 *
 * @param {number} id  song id
 * @param {number} [br=320000]  bitrate (128000, 192000, 320000, 999000)
 * @returns {Promise<string|null>}
 */
export async function getSongUrl(id, br = 320000) {
  const { value } = await songUrlCache.get(`url:${id}:${br}`, async () => {
    const data = await request(song_url, { id, br })
    const url = data?.data?.[0]?.url ?? null
    return url
  })
  return value
}

/**
 * Get playlist details including track list.
 *
 * @param {number} id  playlist id
 * @returns {Promise<{id:number,name:string,cover:string,trackCount:number,tracks:Array}>}
 */
export async function getPlaylistDetail(id) {
  const { value } = await playlistCache.get(`playlist:${id}`, async () => {
    const data = await request(playlist_detail, { id })
    const pl = data?.playlist
    return {
      id: pl?.id ?? id,
      name: pl?.name ?? '',
      cover: pl?.coverImgUrl ?? '',
      trackCount: pl?.trackCount ?? 0,
      tracks: (pl?.tracks ?? []).map(normaliseSong),
    }
  })
  return value
}

/**
 * Get user listening records.
 *
 * @param {number} uid  user id
 * @param {number} [type=1]  0=all time, 1=last week
 * @returns {Promise<Array<{playCount:number, song:object}>>}
 */
export async function getUserRecord(uid, type = 1) {
  const { value } = await recordCache.get(`record:${uid}:${type}`, async () => {
    const data = await request(user_record, { uid, type })
    const records = data?.allData ?? data?.weekData ?? []
    return records.map((item) => ({
      playCount: item.playCount ?? 0,
      song: normaliseSong(item.song),
    }))
  })
  return value
}

/**
 * Get lyrics for a song.
 *
 * @param {number} id  song id
 * @returns {Promise<string|null>}  raw LRC text, or null if unavailable
 */
export async function getLyric(id) {
  const { value } = await lyricCache.get(`lyric:${id}`, async () => {
    const data = await request(lyric, { id })
    return data?.lrc?.lyric ?? null
  })
  return value
}
