import type { PostDef } from './types'

const post: PostDef = {
  id: 'threejs-atlas-flipy',
  hidden: true,
  index: '03',
  title: { zh: 'Three.js 图集与 flipY 陷阱', en: 'Three.js Atlas & the flipY Trap' },
  excerpt: {
    zh: '一个看似微小的 CanvasTexture 默认参数，如何让多个模型生成的 3D 世界出现同样的贴图错乱——以及为什么这个问题值得记录下来。',
    en: 'How a seemingly minor CanvasTexture default caused the same texture corruption across multiple LLM-generated 3D worlds — and why it is worth documenting.',
  },
  body: {
    zh: `在评测多个 LLM 生成的 Minecraft 克隆时，我们发现了一个有趣的现象：五个模型中有四个出现了几乎完全相同的贴图问题。

大地看起来像是被反色了。草块顶部显示的是黑曜石的纹理。树叶上有奇怪的透明孔洞。

五个模型，四种不同的架构，同一个 bug。

**根因**

问题出在 CanvasTexture 上。在 Three.js 中，CanvasTexture 默认设置 \`flipY = true\`。这个默认值对照片纹理是合理的——照片通常从上到下存储，而 WebGL 的纹理坐标从下到上。

但当模型在 Canvas 上手绘贴图集（texture atlas），然后手动计算 UV 坐标时，问题就出现了。模型按照从上到下的行序编排 UV，却忘记了 CanvasTexture 默认会上下翻转。

结果：第一行和第二行互换，采样错位，颜色混乱。

**为什么值得记录**

这个案例有趣的地方在于：

1. **多个独立模型犯了同样的错误**——这不是个别模型的疏忽，而是 LLM 对框架默认值理解的一个普遍盲点
2. **修复极其简单**——加一行 \`flipY = false\` 就够了——但找到那一行需要在 Three.js 渲染管线的理解上花功夫
3. **它揭示了 LLM 的知识边界**——模型可能熟悉高级 API 的使用，但对底层默认值及其交互缺乏直觉

**教训**

无论是在写代码还是在用 AI 辅助编程，对框架默认值的理解都是不可替代的。默认值之所以存在是因为它们对大多数场景是合理的——但"大多数"不等于"所有"。`,
    en: `While evaluating several LLM-generated Minecraft clones, we noticed an interesting pattern: four out of five models had nearly identical texture corruption.

The ground looked color-inverted. Grass tops rendered as obsidian. Leaves had strange transparent holes.

Five models, four different architectures, the same bug.

**Root cause**

The issue was CanvasTexture. In Three.js, CanvasTexture defaults to \`flipY = true\`. This default makes sense for photographs — images are typically stored top-to-bottom, while WebGL texture coordinates run bottom-to-top.

But the problem arises when a model hand-paints a texture atlas on a canvas, then manually computes UV coordinates. The model arranges UVs top-to-bottom, forgetting that CanvasTexture flips them by default.

Result: row one and row two swap, UVs misalign, colors go wild.

**Why it is worth documenting**

This case is interesting because:

1. **Multiple independent models made the same mistake** — not a fluke of one model, but a systemic blind spot in LLM understanding of framework defaults
2. **The fix is trivial** — one line of \`flipY = false\` — but finding it requires understanding the Three.js rendering pipeline
3. **It reveals the boundaries of LLM knowledge** — models may be fluent in high-level APIs but lack intuition about low-level defaults and their interactions

**Lesson**

Whether writing code yourself or using AI assistance, understanding framework defaults is irreplaceable. Defaults exist because they are reasonable for most scenarios — but "most" is not "all".`,
  },
  tags: ['TECH', '3D', 'LLM'],
  date: '2026.06.02',
  readTime: '3 min',
}

export default post
