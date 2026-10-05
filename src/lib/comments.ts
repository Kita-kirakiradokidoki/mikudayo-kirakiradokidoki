import { useCallback, useEffect, useRef, useState } from 'react'
import { COMMENTS } from '../data/comments'

/**
 * Visitor comments for the homepage guestbook and per-article threads.
 * See `server/comments.mjs` for the API this talks to.
 */
export type VisitorComment = {
  id: string
  author: string
  text: string
  /** `null` means the homepage guestbook. */
  postId: string | null
  createdAt: string
}

/** What the UI renders: static seeded comments have no id or timestamp. */
export type DisplayComment = {
  id: string
  author: string
  text: string
  createdAt: string | null
}

export class CommentsRequestError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'CommentsRequestError'
    this.code = code
  }
}

/** Failures that mean "there is no comment service here" (static hosting). */
export const COMMENTS_SILENT_CODES = new Set(['bad_response', 'unknown_route', 'method_not_allowed'])

/** Mirrors `AUTHOR_MAX` / `TEXT_MAX` in `server/comments.mjs`. */
export const COMMENTS_AUTHOR_MAX = 24
export const COMMENTS_TEXT_MAX = 500

const DEFAULT_API_BASE = '/api/comments'

function base(apiBase?: string) {
  return (apiBase ?? DEFAULT_API_BASE).replace(/\/+$/, '')
}

/**
 * The API answers `{ ok: true, ... }` or `{ ok: false, code, error }`. A body that
 * is not that shape at all — an HTML 404 page from static hosting, say — is
 * reported as `bad_response` so the caller can treat it as "no service here".
 */
async function readJson(res: Response): Promise<Record<string, unknown>> {
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    throw new CommentsRequestError(`Bad response from the comment service (${res.status})`, 'bad_response')
  }
  const record = body as Record<string, unknown> | null
  if (!res.ok || !record || record.ok !== true) {
    throw new CommentsRequestError(
      typeof record?.error === 'string' ? record.error : `Comment service responded with ${res.status}`,
      typeof record?.code === 'string' ? record.code : 'request_failed',
    )
  }
  return record
}

/** Comments for one scope: `null` is the homepage guestbook, otherwise a post id. */
export async function fetchComments({
  postId = null,
  apiBase,
  signal,
}: { postId?: string | null; apiBase?: string; signal?: AbortSignal } = {}): Promise<VisitorComment[]> {
  const url = new URL(base(apiBase), window.location.origin)
  if (postId) url.searchParams.set('post', postId)
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } })
  const body = await readJson(res)
  return Array.isArray(body.comments) ? (body.comments as VisitorComment[]) : []
}

/**
 * Post a comment. `website` is the honeypot — it is never shown to a person, so a
 * non-empty value means a bot; the server then accepts and discards it, which is
 * why this resolves with `null` rather than a comment in that case.
 */
export async function submitComment({
  author,
  text,
  postId = null,
  website = '',
  apiBase,
}: {
  author: string
  text: string
  postId?: string | null
  website?: string
  apiBase?: string
}): Promise<VisitorComment | null> {
  const res = await fetch(new URL(base(apiBase), window.location.origin), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ author, text, postId, website }),
  })
  const body = await readJson(res)
  return (body.comment as VisitorComment | null) ?? null
}

/** Admin-only. `adminKey` is the value of `COMMENTS_ADMIN_KEY` on the server. */
export async function deleteComment({
  id,
  adminKey,
  apiBase,
}: {
  id: string
  adminKey: string
  apiBase?: string
}): Promise<void> {
  const res = await fetch(`${new URL(base(apiBase), window.location.origin).toString()}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey, accept: 'application/json' },
  })
  await readJson(res)
}

/**
 * The seeded comments in `comments/*.md` belong to the homepage only — they are
 * not attached to any article. The index is part of the id because an author may
 * write the same line twice, and React keys have to stay distinct.
 */
function seededFor(postId: string | null): DisplayComment[] {
  if (postId) return []
  return COMMENTS.map((c, index) => ({
    id: `seed:${index}:${c.author}:${c.text}`,
    author: c.author,
    text: c.text,
    createdAt: null,
  }))
}

export type UseCommentsResult = {
  comments: DisplayComment[]
  error: CommentsRequestError | null
  /** true when this deployment has no comment service, so the thread stays hidden */
  silent: boolean
  loading: boolean
  submitting: boolean
  /** resolves false when the comment was rejected; `error` then says why */
  submit: (author: string, text: string, website?: string) => Promise<boolean>
  refresh: () => void
}

/**
 * The one place the seeded comments and the fetched ones meet: the homepage shows
 * both, an article shows only its own visitor comments.
 */
export function useComments({
  postId = null,
  enabled = true,
  apiBase,
}: { postId?: string | null; enabled?: boolean; apiBase?: string } = {}): UseCommentsResult {
  const [fetched, setFetched] = useState<VisitorComment[]>([])
  const [error, setError] = useState<CommentsRequestError | null>(null)
  const [silent, setSilent] = useState(false)
  const [loading, setLoading] = useState(enabled)
  const [submitting, setSubmitting] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    // A slower earlier request must not overwrite the newer result.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const list = await fetchComments({ postId, apiBase, signal: controller.signal })
      if (controller.signal.aborted) return
      setFetched(list)
      setError(null)
    } catch (err) {
      if (controller.signal.aborted) return
      if (err instanceof Error && err.name === 'AbortError') return
      const failure =
        err instanceof CommentsRequestError
          ? err
          : new CommentsRequestError(err instanceof Error ? err.message : 'Comment request failed', 'network_error')
      if (COMMENTS_SILENT_CODES.has(failure.code)) setSilent(true)
      else setError(failure)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [apiBase, enabled, postId])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    void load()
    return () => abortRef.current?.abort()
  }, [enabled, load])

  const submit = useCallback(
    async (author: string, text: string, website = '') => {
      setSubmitting(true)
      try {
        await submitComment({ author, text, postId, website, apiBase })
        await load() // show the visitor their own comment straight away
        return true
      } catch (err) {
        const failure =
          err instanceof CommentsRequestError
            ? err
            : new CommentsRequestError(err instanceof Error ? err.message : 'Comment request failed', 'network_error')
        setError(failure)
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [apiBase, load, postId],
  )

  return {
    comments: [
      ...seededFor(postId),
      ...fetched.map((c) => ({ id: c.id, author: c.author, text: c.text, createdAt: c.createdAt })),
    ],
    error,
    silent,
    loading,
    submitting,
    submit,
    refresh: () => void load(),
  }
}
