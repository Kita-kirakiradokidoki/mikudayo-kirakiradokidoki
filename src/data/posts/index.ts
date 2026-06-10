export type { PostDef } from './types'

import post01 from './test-post'

export const POSTS = [
  post01,
].filter((p) => !p.hidden)
