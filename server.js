import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './server/env.mjs'
import { steamApi } from './server/api.mjs'
import { isConfigured } from './server/steam.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

loadEnv(__dirname)

const app = express()
const PORT = process.env.PORT || 3000

// Steam Web API proxy (keeps STEAM_API_KEY server-side)
app.use(steamApi())

// Gzip 压缩
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '7d',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache')
    }
  }
}))

// SPA 回退
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`NAGI BLOG running at http://localhost:${PORT}`)
  if (!isConfigured()) {
    console.warn('[steam-api] STEAM_API_KEY missing — the Steam card stays hidden.')
  }
})
