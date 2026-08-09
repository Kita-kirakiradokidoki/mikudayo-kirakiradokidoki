import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from './server/env.mjs'
import { steamApi, neteaseApi } from './server/api.mjs'

/**
 * Mount the Steam Web API proxy on the dev server so `npm run dev` behaves
 * exactly like production (`npm start`), without leaking STEAM_API_KEY to the
 * browser bundle.
 */
function steamApiPlugin(): Plugin {
  return {
    name: 'steam-api-dev',
    apply: 'serve',
    configureServer(server) {
      loadEnv()
      server.middlewares.use(steamApi())
    },
  }
}

/**
 * Mount the NetEase Cloud Music API proxy on the dev server so `npm run dev`
 * behaves exactly like production (`npm start`).
 */
function neteaseApiPlugin(): Plugin {
  return {
    name: 'netease-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(neteaseApi())
    },
  }
}

export default defineConfig({
  base: process.env.PAGES_BASE_URL || '/',
  // .ttc (TrueType Collection) isn't in Vite's default asset list; treat it as a static asset.
  assetsInclude: ['**/*.ttc'],
  plugins: [react(), tailwindcss(), steamApiPlugin(), neteaseApiPlugin()],
})
