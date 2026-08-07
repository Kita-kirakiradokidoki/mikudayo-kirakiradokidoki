import { getSteamProfile, isConfigured, SteamError } from './steam.mjs'

/**
 * Connect/Express compatible middleware exposing the Steam proxy.
 *
 * Mounted both by the Vite dev server (`vite.config.ts`) and by the production
 * Express server (`server.js`) so the same routes exist in every environment.
 *
 *   GET /api/steam/health
 *   GET /api/steam/profile?id=<steamid64 | vanity | profile url>[&refresh=1]
 *
 * @param {{ basePath?: string }} [options]
 */
export function steamApi(options = {}) {
  const basePath = options.basePath ?? '/api/steam'

  return async function steamApiMiddleware(req, res, next) {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (!url.pathname.startsWith(basePath)) return next()

    const route = url.pathname.slice(basePath.length).replace(/\/+$/, '') || '/'

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, { ok: false, code: 'method_not_allowed' })
    }

    try {
      if (route === '/health') {
        return send(res, 200, { ok: true, configured: isConfigured() }, 0)
      }

      if (route === '/profile') {
        const id = url.searchParams.get('id')
        if (!id) {
          return send(res, 400, {
            ok: false,
            code: 'bad_request',
            error: 'Query parameter "id" is required',
          })
        }
        const payload = await getSteamProfile(id, {
          refresh: url.searchParams.get('refresh') === '1',
        })
        return send(res, 200, payload, 30)
      }

      return send(res, 404, { ok: false, code: 'unknown_route', error: 'Unknown route' })
    } catch (err) {
      const status = err instanceof SteamError ? err.status : 500
      const code = err instanceof SteamError ? err.code : 'internal_error'
      if (status >= 500 && status !== 503) {
        console.error('[steam-api]', err)
      }
      return send(res, status, {
        ok: false,
        code,
        error: err instanceof Error ? err.message : 'Unexpected error',
      })
    }
  }
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} body
 * @param {number} [maxAge] `Cache-Control: max-age` in seconds
 */
function send(res, status, body, maxAge = 0) {
  const json = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader(
    'cache-control',
    maxAge > 0 ? `public, max-age=${maxAge}` : 'no-store',
  )
  res.end(json)
}
