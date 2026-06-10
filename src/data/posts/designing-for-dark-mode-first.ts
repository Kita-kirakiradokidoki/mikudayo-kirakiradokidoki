import type { PostDef } from './types'

const post: PostDef = {
  id: 'designing-for-dark-mode-first',
  hidden: true,
  index: '04',
  title: { zh: '优先深色模式的设计', en: 'Designing Dark Mode First' },
  excerpt: {
    zh: '为什么从深色模式开始设计会带来更好的主题系统，以及如何优雅地处理浅色模式的转换。',
    en: 'Why starting with dark mode leads to a better theming system, and how to transition to light mode gracefully.',
  },
  body: {
    zh: `大多数项目是先设计浅色模式，再把深色模式作为"额外工作"加上去。结果深色模式看起来像是事后想法。

我们选择了相反的方向。

**深色优先**

当你的默认画布是黑色时，你会以不同的方式思考光。高亮色不是加在白色背景上的装饰——它们是在黑暗中发光的信标。

深色模式优先有以下优势：

1. **强调色更有效**——在深色背景上，一个亮绿色的方块不需要很大就能引起注意。在浅色背景上，同样的颜色看起来像儿童玩具。
2. **层级更清晰**——在深色模式中，不同的灰色调（ink、ink-2、paper、dim）创造了一个自然的视觉层级。浅色模式中，这些对比更容易丢失。
3. **性能心态**——深色模式在 OLED 屏幕上消耗更少的电量。从深色开始意味着你默认选择了更高效的路径。

**CSS 变量作为基础**

通过使用 CSS 变量（自定义属性），我们可以在深色和浅色之间切换，而无需触及组件代码。

\`\`\`css
:root {
  --color-ink: #0a0a0e;
  --color-paper: #ecece4;
}

[data-theme="light"] {
  --color-ink: #f2f1e9;
  --color-paper: #14141a;
}
\`\`\`

关键洞察：变量名反映的是角色，而不是颜色。\`ink\` 是背景还是前景取决于主题。\`accent\` 在两个主题中都保持强调色的角色，只是具体色值不同。

**过渡**

主题切换不应是突兀的。我们在 body 上添加了 \`transition: background-color 0.45s ease, color 0.45s ease\`，让切换变得平滑。0.45 秒足够长以产生动画感，又足够短以避免等待。

**结论**

深色模式优先不是一种审美选择——它是一种系统性的设计决策。它迫使你更严谨地思考颜色、对比度和层级。而当你最终添加浅色模式时，结果会更好。`,
    en: `Most projects design light mode first, then add dark mode as "extra work". The result is that dark mode looks like an afterthought.

We chose the opposite direction.

**Dark first**

When your default canvas is black, you think about light differently. Accent colors are not decorations on a white background — they are beacons shining in the dark.

Dark mode first has several advantages:

1. **Accents work better** — on a dark background, a bright green square does not need to be large to attract attention. On a light background, the same color looks like a toy.
2. **Hierarchy is clearer** — in dark mode, different shades of gray create a natural visual hierarchy. In light mode, these contrasts are easier to lose.
3. **Performance mindset** — dark mode uses less power on OLED screens. Starting dark means you default to the more efficient path.

**CSS variables as foundation**

By using CSS custom properties, we can switch between dark and light without touching component code.

\`\`\`css
:root {
  --color-ink: #0a0a0e;
  --color-paper: #ecece4;
}

[data-theme="light"] {
  --color-ink: #f2f1e9;
  --color-paper: #14141a;
}
\`\`\`

Key insight: variable names reflect role, not color. \`ink\` is background or foreground depending on the theme. \`accent\` maintains its accent role in both themes, just with different values.

**Transitions**

Theme switching should not be jarring. We added \`transition: background-color 0.45s ease, color 0.45s ease\` on body to make it smooth. 0.45 seconds is long enough to feel animated, short enough to not feel like waiting.

**Conclusion**

Dark mode first is not an aesthetic choice — it is a systemic design decision. It forces you to think more rigorously about color, contrast, and hierarchy. And when you finally add light mode, the result is better.`,
  },
  tags: ['DESIGN', 'TECH'],
  date: '2026.06.05',
  readTime: '4 min',
}

export default post
