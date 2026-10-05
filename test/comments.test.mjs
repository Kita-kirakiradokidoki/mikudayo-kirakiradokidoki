import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validateComment, createCommentStore } from '../server/comments.mjs'

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
