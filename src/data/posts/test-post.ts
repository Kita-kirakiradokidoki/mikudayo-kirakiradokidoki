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
    zh: `# 第一章
中文正文内容。支持 **粗体** 和 \`代码\` 。

一个代码块示例：

\`\`\`ts
const greet = (name: string) => \`你好，\${name}\`
greet('世界')
\`\`\`

现在由真正的 Markdown 库渲染。行内支持：**粗体**、*斜体*、\`代码\`、[链接](https://example.com)。
也支持块级元素：

- 第一项
- 第二项含 \`代码\`
- 第三项含 [链接](https://example.com)

## 音乐小节

^moonlight^

# 2

^cradle^


### 细节说明
CN TEST`,
    en: `# Chapter One
English body content. Use **bold** and \`code\` as usual.

A fenced code block:

\`\`\`ts
const greet = (name: string) => \`hello, \${name}\`
greet('world')
\`\`\`

Now rendered by a real markdown library. Supported inline: **bold**, *italic*, \`code\`,
and [links](https://example.com). Block elements too:

- first item
- second item with \`code\`
- third item with [a link](https://example.com)

## Music Section

^moonlight^

### Details
EN TEST`,
  },
  tags: ['TECH', 'DESIGN', 'TEST'],
  date: '2026.06.15',
  readTime: '1 min',
  audio: [
    { id: 'moonlight', url: '/audio/moonlight.mp3', title: 'Moonlight', artist: '神椿市協奏中', cover: '/audio/moonlight.jpg' },
    { id: 'cradle', url: '/audio/cradle.mp3', title: 'ゆりかご', artist: '神椿市協奏中', cover: '/audio/cradle.jpg' },
  ],
}
export default post