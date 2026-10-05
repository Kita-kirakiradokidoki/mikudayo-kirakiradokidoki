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
