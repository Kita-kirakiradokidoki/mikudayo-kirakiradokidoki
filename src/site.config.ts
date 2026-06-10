export type ThemeColors = {
  ink: string
  ink2: string
  paper: string
  dim: string
  accent: string
  amber: string
  line: string
  gridLine: string
  strokeFaint: string
}

export type SiteConfig = {
  brand: {
    name: string
    shortName: string
    titleWord1: string
    titleWord2: string
  }
  colors: {
    dark: ThemeColors
    light: ThemeColors
  }
  githubUrl: string
  nav: {
    showLang: boolean
    showTheme: boolean
    showGithub: boolean
  }
  hero: {
    showParallax: boolean
    showStats: boolean
    showBadge: boolean
    showUpdated: boolean
  }
  strings: {
    zh: Record<string, string>
    en: Record<string, string>
  }
}

export const SITE_CONFIG: SiteConfig = {
  brand: {
    name: 'Test BLOG',
    shortName: 'qwq',
    titleWord1: 'Nothing~',
    titleWord2: 'Test',
  },

  colors: {
    dark: {
      ink: '#0a0a0e',
      ink2: '#111118',
      paper: '#ecece4',
      dim: '#84848e',
      accent: '#c8f031',
      amber: '#e8a33d',
      line: 'rgb(236 236 228 / 0.12)',
      gridLine: 'rgb(236 236 228 / 0.035)',
      strokeFaint: 'rgb(236 236 228 / 0.18)',
    },
    light: {
      ink: '#f2f1e9',
      ink2: '#eae9e0',
      paper: '#14141a',
      dim: '#5e5e68',
      accent: '#647d00',
      amber: '#a4690f',
      line: 'rgb(20 20 26 / 0.16)',
      gridLine: 'rgb(20 20 26 / 0.055)',
      strokeFaint: 'rgb(20 20 26 / 0.16)',
    },
  },

  githubUrl: 'https://github.com/',

  nav: {
    showLang: true,
    showTheme: true,
    showGithub: true,
  },

  hero: {
    showParallax: true,
    showStats: true,
    showBadge: true,
    showUpdated: true,
  },

  strings: {
    zh: {
      'doc.title': 'Nothing~ · qwq',
      'hero.kicker': 'Blog',
      'hero.badge': 'Null · Nop · Empty',
      'hero.sub': '这个是副标题呀',
      'hero.readMore': '阅读文章',
      'meta.posts': '文章',
      'meta.tags': '标签',
      'meta.updated': '更新于',
      'post.readMore': '阅读全文',
      'post.back': '返回首页',
      'post.published': '发布于',
      'post.tags': '标签',
      'footer.tagline': '占位符喵。',
      'footer.built': '使用 React · GSAP · Tailwind · Bun 构建。',
    },
    en: {
      'doc.title': 'Nothing~ · qwq',
      'hero.kicker': 'Blog',
      'hero.badge': 'Null · Nop · Empty',
      'hero.sub': 'Just a sub title meow~',
      'hero.readMore': 'Read posts',
      'meta.posts': 'posts',
      'meta.tags': 'tags',
      'meta.updated': 'updated',
      'post.readMore': 'Read more',
      'post.back': 'Back to home',
      'post.published': 'Published',
      'post.tags': 'Tags',
      'footer.tagline': 'I am a PlaceHolder',
      'footer.built': 'Built with React · GSAP · Tailwind · Bun.',
    },
  },
}
