import type { PostDef } from './types'

const post: PostDef = {
  id: 'bilingual-design-system',
  hidden: true,
  index: '06',
  title: { zh: '双语设计系统的挑战', en: 'Challenges of a Bilingual Design System' },
  excerpt: {
    zh: '当一个界面需要同时容纳中文和英文，布局、字体、断词——每一个设计决策都需要考虑两种语言。',
    en: 'When an interface must accommodate both Chinese and English, every design decision — layout, typography, word breaking — needs to account for both languages.',
  },
  body: {
    zh: `中英文并排展示不是简单地把文字翻译一下就能解决的问题。

**字数差异**

中文比英文简洁得多。一个中文句子通常比它的英文翻译短 30-40%。这意味着：

- 按钮上的"提交"在英文中是"Submit"——可以，差距不大
- "一次性生成 · 可运行作品"在英文中是"One-shot · Runnable artifacts"——长度翻倍，需要更灵活的空间
- "提示词不会说谎"在英文中是"Prompts do not lie"——类似长度，但节奏感不同

解决方式：在布局中使用灵活尺寸，而不是固定宽度。flex-wrap 和 gap 而不是固定间距。

**字体栈**

\`\`\`css
--font-display: "Space Grotesk", "PingFang SC", "Hiragino Sans GB",
                "Noto Sans SC", system-ui, sans-serif;
\`\`\`

Space Grotesk 在前，因为它是我们的主要展示字体，ASCII 字符优先使用它。中文回退字体紧随其后，确保中文字符有合适的渲染。

关键：两种字体必须具有相似的 x-height 和视觉权重，否则切换语言时布局会"跳动"。

**排版方向**

这不是阿拉伯语那样的 RTL 问题，但仍然存在细微差别：
- 中文标点（。、，）占据全宽空间，而英文标点（. ,）占据半宽
- 中文不区分大小写，所以英文的 ALL CAPS 在中文中需要不同的处理方式
- 中文没有连字符断词，但英文需要

**状态管理**

语言切换不仅仅是替换文字。当用户切换语言时，我们需要：
1. 更新所有可见文本——通过 \`useLang()\` 的 \`t()\` 函数，这自动发生
2. 更新 \`document.title\`——在 LangProvider 的 useEffect 中处理
3. 更新 \`<html lang>\` 属性——同样在 useEffect 中处理
4. 重新计算滚动触发位置——文字长度变化可能改变布局高度，需要调用 ScrollTrigger.refresh()

**结论**

双语设计不是翻译问题——它是布局问题。如果你在设计阶段就考虑两种语言，最终结果会更干净、更灵活、更包容。`,
    en: `Displaying Chinese and English side by side is not a simple matter of translation.

**Length difference**

Chinese is much more concise than English. A Chinese sentence is typically 30-40% shorter than its English translation. This means:

- A button labeled "提交" becomes "Submit" — fine, similar length
- "一次性生成 · 可运行作品" becomes "One-shot · Runnable artifacts" — double the length, requiring flexible space
- "提示词不会说谎" becomes "Prompts do not lie" — similar length but different rhythm

The solution: use flexible sizing, not fixed widths. \`flex-wrap\` and \`gap\` instead of fixed spacing.

**Font stack**

\`\`\`css
--font-display: "Space Grotesk", "PingFang SC", "Hiragino Sans GB",
                "Noto Sans SC", system-ui, sans-serif;
\`\`\`

Space Grotesk comes first as our primary display face. Chinese fallback fonts follow to ensure CJK characters render properly.

The key: both typefaces must have similar x-height and visual weight, otherwise the layout "jumps" when switching languages.

**Typography direction**

This is not an RTL problem like Arabic, but there are still nuances:
- Chinese punctuation (。、，) takes full width while English (. ,) takes half
- Chinese has no capitalization, so ALL CAPS in English needs a different approach in Chinese
- Chinese does not use hyphenation for line breaks, but English does

**State management**

Language switching is not just replacing text. When the user switches languages, we need to:
1. Update all visible text — the \`t()\` function from \`useLang()\` handles this automatically
2. Update \`document.title\` — handled in LangProvider's useEffect
3. Update \`<html lang>\` attribute — also in useEffect
4. Recalculate scroll trigger positions — text length changes may alter layout heights, requiring ScrollTrigger.refresh()

**Conclusion**

Bilingual design is not a translation problem — it is a layout problem. If you consider both languages from the design phase, the result is cleaner, more flexible, and more inclusive.`,
  },
  tags: ['DESIGN', 'TECH', 'I18N'],
  date: '2026.06.10',
  readTime: '4 min',
}

export default post
