import type { PostDef } from './types'

const post: PostDef = {
  id: 'gsap-animation-philosophy',
  hidden: true,
  index: '05',
  title: { zh: 'GSAP 动画的克制与力量', en: 'Restraint & Power in GSAP Animation' },
  excerpt: {
    zh: '动画不是为了炫技。好的动画引导注意力、传达层级、创造节奏感。这里是我们使用 GSAP 的一些原则。',
    en: 'Animation is not about showing off. Good animation guides attention, communicates hierarchy, and creates rhythm. Here are some principles we follow with GSAP.',
  },
  body: {
    zh: `动画在网页设计中被滥用。旋转的加载器、飞入的图标、弹跳的按钮——这些往往在取悦开发者而不是用户。

好的动画应当几乎不被注意。

**三个原则**

1. **动画服务于功能**——滚动进度条（ScrollProgress）的存在是为了回答"我在页面的哪个位置"。它是功能性的，不是装饰性的。
2. **动画传达层级**——我们的 SplitText 字符动画只用于主要标题（h1），从不用于正文。动画的"重量"告诉用户什么值得注意。
3. **动画创造节奏**——交错（stagger）将一群元素的出现变成一个有层次感的序列。0.04 秒的间隔几乎察觉不到，但整体感觉完全不同。

**GSAP 的具体实践**

**ScrollTrigger** 是我们用得最多的插件。关键参数是 \`start\` 和 \`once\`：

\`\`\`js
gsap.from(split.chars, {
  yPercent: 120,
  duration: 0.8,
  ease: 'power4.out',
  stagger: 0.03,
  scrollTrigger: { trigger: scope.current, start: 'top 88%', once: true },
})
\`\`\`

\`start: 'top 88%'\` 表示当元素的顶部到达视口 88% 位置时触发——比默认的 \`top bottom\`（元素顶部到达视口底部）更早，给用户一种"刚好及时"的感觉。

\`once: true\` 确保动画只触发一次。不重复，不打扰。

**性能考虑**

动画不能影响用户体验的流畅性。我们做了以下优化：
- 使用 \`prefersReducedMotion()\` 检查用户偏好，完全禁用动画
- 使用 \`hasFinePointer()\` 只在桌面设备上启用光标效果
- 使用 \`memo\` 隔离持续性动画，避免不必要的重新渲染
- 将 GSAP 动画放在 \`useGSAP\` 中，自动处理清理

**最后**

当你在网站上添加下一个动画时，问自己：这个动画是帮助用户理解页面，还是只是让我觉得页面很酷？

如果答案是后者，删除它。`,
    en: `Animation is overused in web design. Spinning loaders, flying icons, bouncing buttons — these often please the developer more than the user.

Good animation should go almost unnoticed.

**Three principles**

1. **Animation serves function** — the ScrollProgress bar exists to answer "where am I on this page". It is functional, not decorative.
2. **Animation communicates hierarchy** — our SplitText character animation is reserved for primary headings (h1), never body text. The "weight" of the animation tells the user what matters.
3. **Animation creates rhythm** — stagger turns the appearance of a group of elements into a layered sequence. The 0.04s interval is barely noticeable, but the overall feel is completely different.

**Practical GSAP patterns**

**ScrollTrigger** is our most-used plugin. The key parameters are \`start\` and \`once\`:

\`\`\`js
gsap.from(split.chars, {
  yPercent: 120,
  duration: 0.8,
  ease: 'power4.out',
  stagger: 0.03,
  scrollTrigger: { trigger: scope.current, start: 'top 88%', once: true },
})
\`\`\`

\`start: 'top 88%'\` fires when the element's top hits 88% of the viewport — earlier than the default \`top bottom\`, giving the user a "just in time" feeling.

\`once: true\` ensures the animation fires only once. No repeats, no interruptions.

**Performance considerations**

Animation must never compromise the feel of the page. We made these optimizations:
- Check \`prefersReducedMotion()\` to respect user preferences, disable animations entirely
- Use \`hasFinePointer()\` to enable cursor effects only on desktop
- Isolate perpetual animations with \`memo\` to avoid unnecessary re-renders
- Place GSAP animations in \`useGSAP\` for automatic cleanup

**Finally**

When you add the next animation to your site, ask yourself: does this animation help the user understand the page, or does it just make me feel like the page is cool?

If the answer is the latter, remove it.`,
  },
  tags: ['TECH', 'ANIMATION', 'DESIGN'],
  date: '2026.06.08',
  readTime: '5 min',
}

export default post
