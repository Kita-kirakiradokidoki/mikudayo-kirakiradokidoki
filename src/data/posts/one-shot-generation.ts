import type { PostDef } from './types'

const post: PostDef = {
  id: 'one-shot-generation',
  hidden: true,
  index: '02',
  title: { zh: '一次生成的艺术', en: 'The Art of One-Shot Generation' },
  excerpt: {
    zh: '当 LLM 只能有一次机会生成可运行的作品，提示词就不再是简单的指令——而是一场精心策划的沟通。',
    en: 'When an LLM gets only one shot to produce a runnable artifact, the prompt is no longer a simple instruction — it becomes a carefully orchestrated communication.',
  },
  body: {
    zh: `NAGI BENCH 的核心前提很简单：给每个模型同样的提示词，一次生成，不许返工。

这个约束改变了一切。

**提示词作为契约**

在传统的编程中，你可以迭代。写一点代码，运行，调试，修复。人与机器之间有一个反馈循环。

但在一次性生成中，提示词就是全部。它是你与模型之间的契约。你不能说"让我改一下这里"——你必须在第一次就把所有事情说清楚。

这意味着你需要：

1. **明确角色**："你是一个顶级的资深游戏开发者"——这设定了期望
2. **提供约束**："单个 HTML 文件"——限制了技术栈
3. **列出功能**：核心机制的清单
4. **留出创造空间**："由你自行设计"——让模型有发挥的余地

**意外的发现**

一次性生成的约束也揭示了模型之间的有趣差异。当不能迭代时，模型的"第一直觉"就变得至关重要。

有些模型在 3D 数学方面表现出色但纹理处理欠佳。有些模型生成的 SVG 具有惊人的艺术感但缺少结构精度。这些差异在多次迭代中会被掩盖，但在一次性生成中一目了然。

**对开发者的启示**

即使你不在做基准测试，一次性思维也是一种有用的练习。它迫使你在写下第一行代码之前更仔细地思考。你会问更多的前置问题，考虑更多的边界情况。

有时，最好的代码是一气呵成的。`,
    en: `The core premise of NAGI BENCH is simple: give every model the same prompt, one shot, no retries.

This constraint changes everything.

**The prompt as contract**

In traditional programming, you iterate. Write some code, run it, debug, fix. There is a feedback loop between human and machine.

But in one-shot generation, the prompt is everything. It is the contract between you and the model. You cannot say "let me fix that one thing" — you must get it right the first time.

This means you need:

1. **Set the role**: "You are a top-tier veteran game developer" — establishes expectations
2. **Provide constraints**: "A single HTML file" — limits the tech stack
3. **List features**: A checklist of core mechanics
4. **Leave room for creativity**: "At your own discretion" — gives the model room to shine

**Unexpected discoveries**

The one-shot constraint also reveals interesting differences between models. When iteration is not possible, the model's "first instinct" becomes critical.

Some models excel at 3D math but struggle with texture handling. Some generate SVG with striking artistic sense but lack structural precision. These differences would be masked by multiple iterations, but they are laid bare in a single shot.

**Implications for developers**

Even if you are not running benchmarks, the one-shot mindset is a useful exercise. It forces you to think more carefully before writing the first line of code. You ask more upfront questions, consider more edge cases.

Sometimes, the best code is written in one go.`,
  },
  tags: ['LLM', 'TECH', 'THOUGHTS'],
  date: '2026.05.28',
  readTime: '4 min',
}

export default post
