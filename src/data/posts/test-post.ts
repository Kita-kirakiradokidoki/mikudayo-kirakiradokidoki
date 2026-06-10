import type { PostDef } from './types'
const post: PostDef = {
  id: 'test-post',
  index: '01',
  title: { zh: 'Test Post', en: 'EN TEST Post' },
  excerpt: {
    zh: '简短的中文摘要。',
    en: 'A short English excerpt.',
  },
  body: {
    zh: `中文正文内容。支持**粗体**和\`代码\`。
CN TEST`,
    en: `English body content. Use **bold** and \`code\` as usual.
EN TEST`,
  },
  tags: ['TECH', 'DESIGN', 'TEST'],
  date: '2026.06.15',
  readTime: '1 min',
}
export default post