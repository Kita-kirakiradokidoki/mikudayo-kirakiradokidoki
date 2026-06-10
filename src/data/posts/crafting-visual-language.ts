import type { PostDef } from './types'

const post: PostDef = {
  id: 'crafting-visual-language',
  hidden: true,
  index: '01',
  title: { zh: '构建视觉语言', en: 'Crafting a Visual Language' },
  excerpt: {
    zh: '从配色、字体到间距系统，如何为一个项目打造一致的视觉语言。好的设计系统不仅是美学选择，更是沟通工具。',
    en: 'From color palettes and typography to spacing systems — how to build a coherent visual language for any project. A good design system is not just aesthetics, it is communication.',
  },
  body: {
    zh: `每一个设计决策都是一次对话。

当你在暗色背景上放一个亮绿色的方块，你在说什么？你在说"看这里"、"这是重要的"、"这是不同的"。

视觉语言是产品与用户之间的无声对话。它由无数微小的决定组成：这个按钮应该有多大？这个标题用什么字重？行距是 1.5 还是 1.6？

**从约束开始**

约束解放创造力。与其问"我能做什么"，不如问"我该保留什么"。

对于 NAGI 系列项目，我们设定了三条核心约束：

1. 单色 + 一种强调色
2. 两种字体的组合（展示字体 + 等宽字体）
3. 基于 8px 网格的间距系统

这些约束听起来限制性很强，但正是它们让最终的视觉结果有了辨识度。

**颜色的对话**

选择颜色不是从色轮上挑几个好看的颜色。颜色必须传达信息。

在我们的系统中：
- \`ink\`（#0a0a0e）和 \`paper\`（#ecece4）是主要的信息载体——文字、背景、主要形状
- \`acid\`（#c8f031）是唯一的高饱和色——只用于需要引起注意的元素：徽章、进度条、光标
- \`dim\`（#84848e）是次要信息——标签、辅助文字、图标

每个颜色有一个角色，而不是一个漂亮的名字。

**网格作为基础**

网格线背景不仅是一个装饰效果。它传达了一种精确感、工程感。每个像素都有一个位置，设计是有意图的。

48px 的网格大小不是随意选择的——它是 8px 基线的倍数，与间距系统（8、16、24、32、48、64）完美对齐。

**结论**

好的视觉语言就像好的口音——人们不一定能指出它特别在哪里，但他们能感觉到它的存在。而且一旦消失，他们会想念它。`,
    en: `Every design decision is a conversation.

When you place a bright green square on a dark background, what are you saying? You are saying "look here", "this matters", "this is different".

A visual language is the silent conversation between a product and its user. It is composed of countless small decisions: how large should this button be? What font weight for this heading? Should the line-height be 1.5 or 1.6?

**Start with constraints**

Constraints liberate creativity. Instead of asking "what can I do", ask "what should I keep".

For the NAGI series of projects, we set three core constraints:

1. Monochrome + one accent color
2. Two typefaces (display + monospace)
3. An 8px-based spacing system

These constraints sound limiting, but they are precisely what gives the final visual its identity.

**The dialogue of color**

Choosing colors is not about picking a few nice hues from the wheel. Colors must communicate.

In our system:
- \`ink\` (#0a0a0e) and \`paper\` (#ecece4) are the primary carriers of information — text, background, primary shapes
- \`acid\` (#c8f031) is the only high-saturation color — reserved for elements that demand attention: badges, progress bars, cursor
- \`dim\` (#84848e) is for secondary information — labels, auxiliary text, icons

Every color has a role, not just a pretty name.

**The grid as foundation**

The blueprint grid background is not merely decorative. It conveys a sense of precision, of engineering. Every pixel has a place, and the design is intentional.

The 48px grid size is not arbitrary — it is a multiple of the 8px baseline, perfectly aligned with the spacing system (8, 16, 24, 32, 48, 64).

**Conclusion**

A good visual language is like a good accent — people may not be able to point out what is special about it, but they can feel its presence. And when it is gone, they will miss it.`,
  },
  tags: ['DESIGN', 'THOUGHTS'],
  date: '2026.05.21',
  readTime: '5 min',
}

export default post
