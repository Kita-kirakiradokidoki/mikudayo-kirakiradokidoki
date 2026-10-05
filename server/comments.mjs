/**
 * Visitor comments for the homepage guestbook and per-article threads.
 *
 * One store, one file; a comment belongs to the homepage when `postId` is null.
 * Persistence mirrors `server/stats.mjs`: state lives in memory, writes are
 * coalesced and atomic, and a failed write never breaks the running server.
 *
 * Full description: `docs/superpowers/specs/2026-10-05-visitor-comments-design.md`.
 */
import { mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

export const AUTHOR_MAX = 24
export const TEXT_MAX = 500
/** Only the most recent comments are ever returned; there is no pagination. */
export const MAX_LISTED = 200
export const FLUSH_DELAY_MS = 1500
/** Warn (but never delete) once the store grows past this. */
const WARN_FILE_BYTES = 5 * 1024 * 1024
const POST_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

/**
 * Length in characters rather than UTF-16 units, so an emoji costs one and the
 * published limits mean what a visitor expects.
 */
const charLength = (value) => [...value].length

/**
 * Validate a submitted comment. Returns the trimmed values to store, or a
 * stable error code for the API to report.
 */
export function validateComment(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, code: 'bad_request', error: 'Expected a JSON object' }
  }

  const author = typeof input.author === 'string' ? input.author.trim() : ''
  if (!author || charLength(author) > AUTHOR_MAX) {
    return { ok: false, code: 'bad_request', error: `author must be 1-${AUTHOR_MAX} characters` }
  }

  const text = typeof input.text === 'string' ? input.text.trim() : ''
  if (!text || charLength(text) > TEXT_MAX) {
    return { ok: false, code: 'bad_request', error: `text must be 1-${TEXT_MAX} characters` }
  }

  let postId = null
  if (input.postId !== null && input.postId !== undefined && input.postId !== '') {
    if (typeof input.postId !== 'string' || !POST_ID_RE.test(input.postId)) {
      return { ok: false, code: 'bad_request', error: 'postId is not a valid post id' }
    }
    postId = input.postId
  }

  return { ok: true, value: { author, text, postId } }
}

/** A stored entry is only trusted if it has the shape we wrote. */
function isStoredComment(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.author === 'string' &&
    typeof value.text === 'string' &&
    (value.postId === null || typeof value.postId === 'string') &&
    typeof value.createdAt === 'string'
  )
}

/** A missing or unreadable file is not an error — the guestbook just starts empty. */
function loadComments(file) {
  if (!file) return []
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8'))
    if (!Array.isArray(raw)) {
      console.warn('[comments] comments file is not an array — starting empty')
      return []
    }
    return raw.filter(isStoredComment)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('[comments] ignoring unreadable comments file:', err.message)
    }
    return []
  }
}

/**
 * In-memory comment store, coalesced to disk.
 *
 * `now` is injectable so ids and timestamps are deterministic under test;
 * `file: null` keeps the store purely in memory; `flushDelayMs <= 0` writes only
 * when `flush()` is called explicitly.
 */
export function createCommentStore({
  file = null,
  now = Date.now,
  flushDelayMs = FLUSH_DELAY_MS,
  onError = (err) => console.error('[comments] failed to persist comments:', err.message),
} = {}) {
  const comments = loadComments(file)
  let timer = null
  let dirty = false

  function list(postId = null) {
    return comments
      .filter((c) => c.postId === postId)
      .slice(-MAX_LISTED)
      .reverse()
  }

  function add({ author, text, postId = null }) {
    const comment = {
      id: randomUUID(),
      author,
      text,
      postId,
      createdAt: new Date(now()).toISOString(),
    }
    comments.push(comment)
    markDirty()
    return comment
  }

  function remove(id) {
    const index = comments.findIndex((c) => c.id === id)
    if (index === -1) return false
    comments.splice(index, 1)
    markDirty()
    return true
  }

  function markDirty() {
    dirty = true
    if (!file || flushDelayMs <= 0 || timer) return
    timer = setTimeout(() => {
      timer = null
      flush()
    }, flushDelayMs)
    // Never hold the process open just to write comments.
    timer.unref?.()
  }

  function flush() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (!file || !dirty) return

    try {
      mkdirSync(dirname(file), { recursive: true })
      // Write beside the target and rename, so a crash mid-write cannot leave a
      // half-written file behind.
      const temp = `${file}.tmp`
      writeFileSync(temp, `${JSON.stringify(comments, null, 2)}\n`)
      renameSync(temp, file)
      dirty = false
      warnIfLarge(file)
    } catch (err) {
      // Leave `dirty` set so a later flush retries once the cause is cleared.
      onError(err)
    }
  }

  function warnIfLarge(target) {
    try {
      const { size } = statSync(target)
      if (size > WARN_FILE_BYTES) {
        console.warn(
          `[comments] comments file has grown to ${(size / 1024 / 1024).toFixed(1)} MB — consider archiving old comments`,
        )
      }
    } catch {
      // Sizing is advisory only.
    }
  }

  return { list, add, remove, flush }
}

export const MAX_BODY_BYTES = 4 * 1024

/** An error carrying the HTTP status and stable code the API should report. */
export class CommentsError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'CommentsError'
    this.status = status
    this.code = code
  }
}

/**
 * The visitor's address as seen through Nginx. The proxy passes the real address
 * in `X-Forwarded-For`, so `req.socket.remoteAddress` would always be 127.0.0.1.
 */
export function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for']
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded
  if (typeof raw === 'string' && raw.trim()) return raw.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

/** Drop stale keys so forged addresses cannot grow the table without bound. */
function prune(map, now, windowMs, maxKeys) {
  if (map.size <= maxKeys) return
  for (const [key, entry] of map) {
    const stamp = typeof entry === 'number' ? entry : entry.start
    if (now - stamp >= windowMs) map.delete(key)
  }
  if (map.size > maxKeys) map.clear()
}

/** One comment per address per window. */
export function createPostLimiter({ windowMs = 60_000, maxKeys = 10_000, now = Date.now } = {}) {
  const seen = new Map()
  return {
    allow(ip) {
      const t = now()
      prune(seen, t, windowMs, maxKeys)
      const last = seen.get(ip)
      if (last !== undefined && t - last < windowMs) return false
      seen.set(ip, t)
      return true
    },
  }
}

/**
 * Counts failed admin-key attempts only. Successful deletes must not be limited,
 * or the site owner cannot clear several spam comments in a row.
 */
export function createAuthLimiter({
  windowMs = 60_000,
  maxAttempts = 10,
  maxKeys = 10_000,
  now = Date.now,
} = {}) {
  const attempts = new Map()
  return {
    allow(ip) {
      const t = now()
      prune(attempts, t, windowMs, maxKeys)
      const entry = attempts.get(ip)
      if (!entry || t - entry.start >= windowMs) {
        attempts.set(ip, { start: t, count: 1 })
        return true
      }
      if (entry.count >= maxAttempts) return false
      entry.count += 1
      return true
    },
    clear(ip) {
      attempts.delete(ip)
    },
  }
}

/**
 * Read a JSON request body with a hard size cap.
 *
 * Written by hand because this middleware also runs on the Vite dev server as a
 * raw connect middleware, where `express.json()` does not exist.
 */
export function readJsonBody(req, { maxBytes = MAX_BODY_BYTES } = {}) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false

    const fail = (err) => {
      if (settled) return
      settled = true
      reject(err)
    }

    req.on('data', (chunk) => {
      if (settled) return
      size += chunk.length
      if (size > maxBytes) {
        fail(new CommentsError('Request body is too large', 413, 'payload_too_large'))
        req.destroy?.()
        return
      }
      chunks.push(chunk)
    })

    req.on('end', () => {
      if (settled) return
      const raw = Buffer.concat(chunks).toString('utf8').trim()
      if (!raw) return fail(new CommentsError('Expected a JSON body', 400, 'bad_request'))
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        return fail(new CommentsError('Request body is not valid JSON', 400, 'bad_request'))
      }
      settled = true
      resolve(parsed)
    })

    req.on('error', (err) => fail(new CommentsError(err.message, 400, 'bad_request')))
  })
}
