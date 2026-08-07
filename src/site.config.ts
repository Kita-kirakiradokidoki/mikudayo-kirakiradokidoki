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
  background: {
    type: 'none' | 'image'
    url: string
    overlay: number
    blur: number
    fit: 'cover' | 'contain' | 'repeat'
  }
  audio: {
    home: {
      enabled: boolean
      /** default volume, 0~1 */
      volume: number
      /** playlist: played in order and looped on the homepage */
      tracks: {
        url: string
        title: string
        artist: string
        cover: string
      }[]
    }
  }
  grid: {
    enabled: boolean
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
    name: 'Miku da yo-作品集',
    shortName: '-miku-',
    titleWord1: 'MIKU DA YO',
    titleWord2: 'MUSIC',
  },

  colors: {
    dark: {
      ink: '#f5f5f0',
      ink2: '#0a0a0f',
      paper: '#0f0f17',
      dim: '#a0a0b0',
      accent: '#d4ff1f',
      amber: '#ffb347',
      line: 'rgb(245 245 240 / 0.15)',
      gridLine: 'rgb(245 245 240 / 0.06)',
      strokeFaint: 'rgb(245 245 240 / 0.22)',
    },
    light: {
      ink: '#111118',
      ink2: '#fafaf5',
      paper: '#fcfcf7',
      dim: '#6b6b78',
      accent: '#84a300',
      amber: '#d48400',
      line: 'rgb(17 17 24 / 0.18)',
      gridLine: 'rgb(17 17 24 / 0.07)',
      strokeFaint: 'rgb(17 17 24 / 0.2)',
    },
  },

  githubUrl: 'https://github.com/minecraftgive/Vibe_Code_Blog/',

  nav: {
    showLang: true,
    showTheme: true,
    showGithub: true,
  },

  background: {
    type: 'image',
    url: '/bg.jpg',
    overlay: 0.5,
    blur: 0,
    fit: 'cover',
  },

  audio: {
    home: {
      enabled: true,
      volume: 0.2,
      tracks: [
        {
          url: '/audio/main.mp3',
          title: 'インパアフェクシオン・ホワイトガアル',
          artist: 'ツミキ/月乃',
          cover: '/audio/main.webp',
        },
      ],
    },
  },

  grid: {
    enabled: false,
  },

  hero: {
    showParallax: true,
    showStats: true,
    showBadge: true,
    showUpdated: true,
  },

  strings: {
    zh: {
      'doc.title': 'Miku da yo-',
      'hero.kicker': 'Blog',
      'hero.badge': 'Music · Share · Game',
      'hero.sub': '个人作品集',
      'hero.readMore': '阅读文章',
      'meta.posts': '文章',
      'meta.tags': '标签',
      'meta.updated': '更新于',
      'post.readMore': '阅读全文',
      'post.back': '返回首页',
      'post.published': '发布于',
      'post.tags': '标签',
      'post.audio': '音频',
      'post.toc': '目录',
      'audio.play': '播放音乐',
      'audio.pause': '暂停音乐',
      'footer.tagline': '咕咕嘎嘎？',
      'footer.built': '使用 React · GSAP · Tailwind · Bun 构建。',
    },
    en: {
      'doc.title': 'Miku da yo-',
      'hero.kicker': 'Blog',
      'hero.badge': 'Music · Share · Game',
      'hero.sub': 'Just a sub title meow~',
      'hero.readMore': 'Read posts',
      'meta.posts': 'posts',
      'meta.tags': 'tags',
      'meta.updated': 'updated',
      'post.readMore': 'Read more',
      'post.back': 'Back to home',
      'post.published': 'Published',
      'post.tags': 'Tags',
      'post.audio': 'Audio',
      'post.toc': 'Contents',
      'audio.play': 'Play music',
      'audio.pause': 'Pause music',
      'footer.tagline': 'I am a PlaceHolder',
      'footer.built': 'Built with React · GSAP · Tailwind · Bun.',
    },
  },
}