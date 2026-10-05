import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  validateComment,
  createCommentStore,
  createPostLimiter,
  createAuthLimiter,
  readJsonBody,
  CommentsError,
  clientIp,
} from '../server/comments.mjs'

const AT = Date.UTC(2026, 9, 5, 4, 0, 0) // fixed clock for every test

function tempCommentsFile(contents) {
  const dir = mkdtempSync(join(tmpdir(), 'nagi-comments-'))
  const file = join(dir, 'comments.json')
  if (contents !== undefined) {
    writeFileSync(file, typeof contents === 'string' ? contents : JSON.stringify(contents))
  }
  return { file, dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}

const storeAt = (file) => createCommentStore({ file, now: () => AT, flushDelayMs: 0 })

test('validateComment rejects an empty or missing nickname', () => {
  assert.equal(validateComment({ text: 'hi' }).code, 'bad_request')
  assert.equal(validateComment({ author: '   ', text: 'hi' }).code, 'bad_request')
})

test('validateComment rejects a nickname longer than 24 characters', () => {
  assert.equal(validateComment({ author: 'a'.repeat(24), text: 'hi' }).ok, true)
  assert.equal(validateComment({ author: 'a'.repeat(25), text: 'hi' }).code, 'bad_request')
})

test('validateComment counts characters, not UTF-16 units', () => {
  // Each emoji is two UTF-16 units but one character.
  assert.equal(validateComment({ author: '👍'.repeat(24), text: 'hi' }).ok, true)
})

test('validateComment rejects empty or oversized bodies', () => {
  assert.equal(validateComment({ author: 'a', text: '  ' }).code, 'bad_request')
  assert.equal(validateComment({ author: 'a', text: 'x'.repeat(500) }).ok, true)
  assert.equal(validateComment({ author: 'a', text: 'x'.repeat(501) }).code, 'bad_request')
})

test('validateComment trims and normalises the post id', () => {
  assert.deepEqual(validateComment({ author: ' a ', text: ' b ', postId: null }).value, {
    author: 'a',
    text: 'b',
    postId: null,
  })
  assert.equal(validateComment({ author: 'a', text: 'b', postId: 'test-post' }).value.postId, 'test-post')
  assert.equal(validateComment({ author: 'a', text: 'b', postId: '' }).value.postId, null)
  assert.equal(validateComment({ author: 'a', text: 'b', postId: 'Bad ID!' }).code, 'bad_request')
  assert.equal(validateComment({ author: 'a', text: 'b', postId: 'a'.repeat(65) }).code, 'bad_request')
})

test('list returns newest first and scopes by post id', () => {
  const t = tempCommentsFile()
  try {
    const store = storeAt(t.file)
    store.add({ author: 'a', text: 'first' })
    store.add({ author: 'b', text: 'second' })
    store.add({ author: 'c', text: 'on a post', postId: 'test-post' })

    assert.deepEqual(store.list().map((c) => c.text), ['second', 'first'])
    assert.deepEqual(store.list('test-post').map((c) => c.text), ['on a post'])
    assert.deepEqual(store.list('other-post'), [])
  } finally {
    t.cleanup()
  }
})

test('remove deletes by id and reports whether anything was removed', () => {
  const t = tempCommentsFile()
  try {
    const store = storeAt(t.file)
    const c = store.add({ author: 'a', text: 'bye' })
    assert.equal(store.remove(c.id), true)
    assert.deepEqual(store.list(), [])
    assert.equal(store.remove(c.id), false)
  } finally {
    t.cleanup()
  }
})

test('added comments survive a restart', () => {
  const t = tempCommentsFile()
  try {
    const store = storeAt(t.file)
    store.add({ author: 'a', text: 'persisted' })
    store.flush()
    assert.deepEqual(storeAt(t.file).list().map((c) => c.text), ['persisted'])
  } finally {
    t.cleanup()
  }
})

test('a corrupt comments file is treated as empty rather than thrown', () => {
  const t = tempCommentsFile('{ not json')
  try {
    assert.deepEqual(storeAt(t.file).list(), [])
  } finally {
    t.cleanup()
  }
})

test('a comments file that is valid JSON but not an array is treated as empty', () => {
  const t = tempCommentsFile({ oops: true })
  try {
    assert.deepEqual(storeAt(t.file).list(), [])
  } finally {
    t.cleanup()
  }
})

test('a write failure keeps the in-memory comments usable', () => {
  const dir = mkdtempSync(join(tmpdir(), 'nagi-comments-'))
  const blocker = join(dir, 'blocker')
  writeFileSync(blocker, 'x') // a file where a directory is needed
  const errors = []
  try {
    const store = createCommentStore({
      file: join(blocker, 'comments.json'),
      now: () => AT,
      flushDelayMs: 0,
      onError: (err) => errors.push(err),
    })
    store.add({ author: 'a', text: 'still here' })
    store.flush()
    assert.deepEqual(store.list().map((c) => c.text), ['still here'])
    assert.equal(errors.length, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('list caps at the 200 most recent comments', () => {
  const t = tempCommentsFile()
  try {
    const store = storeAt(t.file)
    for (let i = 0; i < 205; i += 1) store.add({ author: 'a', text: `c${i}` })
    const listed = store.list()
    assert.equal(listed.length, 200)
    assert.equal(listed[0].text, 'c204')
    assert.equal(listed[199].text, 'c5')
  } finally {
    t.cleanup()
  }
})

test('the post limiter allows one comment per IP per window', () => {
  let now = AT
  const limiter = createPostLimiter({ windowMs: 60_000, now: () => now })
  assert.equal(limiter.allow('1.1.1.1'), true)
  assert.equal(limiter.allow('1.1.1.1'), false)
  assert.equal(limiter.allow('2.2.2.2'), true) // a different visitor is unaffected
  now += 60_001
  assert.equal(limiter.allow('1.1.1.1'), true)
})

test('the post limiter recycles its table instead of growing without bound', () => {
  const now = AT
  const limiter = createPostLimiter({ windowMs: 1_000, maxKeys: 10, now: () => now })
  for (let i = 0; i < 50; i += 1) limiter.allow(`10.0.0.${i}`)

  // Enough addresses passed through to evict the earliest ones, so that first
  // address is forgotten and would be admitted again. Without this the table
  // would still be holding all 50 keys and the assertion would report `false`.
  assert.equal(limiter.allow('10.0.0.0'), true)
  // A recent address is still in force, i.e. the table is bounded but not empty.
  assert.equal(limiter.allow('10.0.0.49'), false)
})

test('an overflow sheds only the oldest address rather than wiping every ban', () => {
  const now = AT
  const limiter = createPostLimiter({ windowMs: 60_000, maxKeys: 10, now: () => now })
  for (let i = 0; i < 12; i += 1) limiter.allow(`10.0.0.${i}`)

  // Twelve addresses against a ten-key table. Only the earliest key should have
  // been shed; a `clear()`-style reset would instead have dropped every ban
  // added before the overflow, letting one flood unlock the limiter.
  assert.equal(limiter.allow('10.0.0.5'), false)
  assert.equal(limiter.allow('10.0.0.0'), true)
})

test('the auth limiter counts failures and forgets them once cleared', () => {
  const limiter = createAuthLimiter({ windowMs: 60_000, maxAttempts: 3, now: () => AT })
  assert.equal(limiter.allow('9.9.9.9'), true)
  assert.equal(limiter.allow('9.9.9.9'), true)
  assert.equal(limiter.allow('9.9.9.9'), true)
  assert.equal(limiter.allow('9.9.9.9'), false) // 4th failed try is refused
  limiter.clear('9.9.9.9')
  assert.equal(limiter.allow('9.9.9.9'), true)
})

/** A request stub carrying only what `clientIp` reads. */
const ipReq = (headers = {}, socket = undefined) => ({ headers, socket })

test('clientIp prefers x-real-ip, which our Nginx overwrites with the real address', () => {
  const req = ipReq(
    { 'x-real-ip': '7.7.7.7', 'x-forwarded-for': '1.1.1.1, 7.7.7.7' },
    { remoteAddress: '127.0.0.1' },
  )
  assert.equal(clientIp(req), '7.7.7.7')
})

test('clientIp takes the last X-Forwarded-For hop, not the spoofable first one', () => {
  // `$proxy_add_x_forwarded_for` appends the real address to whatever the client
  // sent, so only the final segment is trustworthy. A visitor can put anything
  // in the leading segments — reading `1.1.1.1` here would let them rotate it
  // per request and bypass the limiter entirely.
  const req = ipReq({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }, { remoteAddress: '127.0.0.1' })
  assert.equal(clientIp(req), '2.2.2.2')
})

test('clientIp handles a repeated X-Forwarded-For header', () => {
  const req = ipReq({ 'x-forwarded-for': ['1.1.1.1', '2.2.2.2, 3.3.3.3'] })
  assert.equal(clientIp(req), '3.3.3.3')
})

test('clientIp trims the address it settles on', () => {
  assert.equal(clientIp(ipReq({ 'x-real-ip': ' 8.8.8.8 ' })), '8.8.8.8')
  assert.equal(clientIp(ipReq({ 'x-forwarded-for': ' 1.1.1.1 , 2.2.2.2 ' })), '2.2.2.2')
})

test('clientIp ignores blank proxy headers and falls back to the socket address', () => {
  const req = ipReq({ 'x-real-ip': '   ', 'x-forwarded-for': '' }, { remoteAddress: '5.5.5.5' })
  assert.equal(clientIp(req), '5.5.5.5')
  assert.equal(clientIp(ipReq()), 'unknown')
})

/** A request stub that replays `chunks` and then ends. */
function bodyReq(chunks) {
  const handlers = {}
  return {
    on(event, fn) {
      handlers[event] = fn
      return this
    },
    destroy() {},
    /** Drive the fake stream once the caller has attached its listeners. */
    async replay() {
      for (const chunk of chunks) handlers.data?.(Buffer.from(chunk))
      handlers.end?.()
    },
    /** Fail the fake stream instead of ending it. */
    emitError(err) {
      handlers.error?.(err)
    },
  }
}

test('readJsonBody parses a JSON body', async () => {
  const req = bodyReq(['{"author":"a",', '"text":"b"}'])
  const pending = readJsonBody(req)
  await req.replay()
  assert.deepEqual(await pending, { author: 'a', text: 'b' })
})

test('readJsonBody rejects a body over the size cap', async () => {
  const req = bodyReq(['x'.repeat(5000)])
  const pending = readJsonBody(req)
  await req.replay()
  await assert.rejects(pending, (err) => err instanceof CommentsError && err.status === 413)
})

test('readJsonBody rejects invalid JSON', async () => {
  const req = bodyReq(['{ not json'])
  const pending = readJsonBody(req)
  await req.replay()
  await assert.rejects(pending, (err) => err instanceof CommentsError && err.status === 400)
})

test('readJsonBody rejects an empty body', async () => {
  const req = bodyReq([])
  const pending = readJsonBody(req)
  await req.replay()
  await assert.rejects(
    pending,
    (err) => err instanceof CommentsError && err.status === 400 && err.message === 'Expected a JSON body',
  )
})

test('readJsonBody reports a stream error as a bad request', async () => {
  const req = bodyReq([])
  const pending = readJsonBody(req)
  req.emitError(new Error('socket hang up'))
  await assert.rejects(
    pending,
    (err) => err instanceof CommentsError && err.status === 400 && err.message === 'socket hang up',
  )
})
