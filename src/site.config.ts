export type Bilingual = { zh: string; en: string }

export type ThemeColors = {
  ink: string
  ink2: string
  paper: string
  dim: string
  accent: string
  accent2: string
  amber: string
  line: string
  gridLine: string
  strokeFaint: string
}

export type Palette = {
  id: PaletteId
  label: Bilingual
  colors: {
    dark: ThemeColors
    light: ThemeColors
  }
}

export type PaletteId = 'classic' | 'aurora' | 'ember' | 'sakura'

export type SiteConfig = {
  brand: {
    name: string
    shortName: string
    titleWord1: string
    titleWord2: string
  }
  colors: Record<PaletteId, Palette>
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
  steam: {
    /** master switch for the bottom-right Steam card */
    enabled: boolean
    /** SteamID64, vanity name, or a full steamcommunity.com profile URL */
    steamId: string
    /** polling interval in seconds (min 15; the proxy caches upstream for 60s) */
    refreshSeconds: number
    /** override when the proxy is hosted on another origin */
    apiBase: string
  }
  netease: {
    /** master switch for the NetEase card + player */
    enabled: boolean
    /** your NetEase Cloud Music user ID */
    uid: number
    /** playlist IDs to show as recommended tabs */
    playlistIds: number[]
    /** polling interval in seconds */
    refreshSeconds: number
    /** override when the proxy is hosted on another origin */
    apiBase: string
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
    classic: {
      id: 'classic',
      label: { zh: '经典', en: 'Classic' },
      colors: {
        dark: {
          ink: '#0f0f17',
          ink2: '#14141f',
          paper: '#f5f5f0',
          dim: '#a0a0b0',
          accent: '#d4ff1f',
          accent2: '#4ff0b7',
          amber: '#ffb347',
          line: 'rgb(245 245 240 / 0.15)',
          gridLine: 'rgb(245 245 240 / 0.06)',
          strokeFaint: 'rgb(245 245 240 / 0.22)',
        },
        light: {
          ink: '#fcfcf7',
          ink2: '#f4f4ee',
          paper: '#111118',
          dim: '#6b6b78',
          accent: '#84a300',
          accent2: '#5a9b6e',
          amber: '#d48400',
          line: 'rgb(17 17 24 / 0.18)',
          gridLine: 'rgb(17 17 24 / 0.07)',
          strokeFaint: 'rgb(17 17 24 / 0.2)',
        },
      },
    },

    aurora: {
      id: 'aurora',
      label: { zh: '极光', en: 'Aurora' },
      colors: {
        dark: {
          ink: '#081018',
          ink2: '#0d1a25',
          paper: '#f0f7fa',
          dim: '#8aa0ad',
          accent: '#2dd4bf',
          accent2: '#60a5fa',
          amber: '#fbbf24',
          line: 'rgb(240 247 250 / 0.16)',
          gridLine: 'rgb(240 247 250 / 0.07)',
          strokeFaint: 'rgb(240 247 250 / 0.24)',
        },
        light: {
          ink: '#f4f9fb',
          ink2: '#e8f1f5',
          paper: '#0a151c',
          dim: '#5a7280',
          accent: '#0d9488',
          accent2: '#2563eb',
          amber: '#b45309',
          line: 'rgb(10 21 28 / 0.16)',
          gridLine: 'rgb(10 21 28 / 0.07)',
          strokeFaint: 'rgb(10 21 28 / 0.22)',
        },
      },
    },

    ember: {
      id: 'ember',
      label: { zh: '余烬', en: 'Ember' },
      colors: {
        dark: {
          ink: '#120a0a',
          ink2: '#1e1212',
          paper: '#faf2ef',
          dim: '#b89a94',
          accent: '#fb923c',
          accent2: '#f87171',
          amber: '#fcd34d',
          line: 'rgb(250 242 239 / 0.16)',
          gridLine: 'rgb(250 242 239 / 0.07)',
          strokeFaint: 'rgb(250 242 239 / 0.24)',
        },
        light: {
          ink: '#fff8f5',
          ink2: '#f7ece7',
          paper: '#1a0f0d',
          dim: '#8b6f6a',
          accent: '#c2410c',
          accent2: '#dc2626',
          amber: '#a16207',
          line: 'rgb(26 15 13 / 0.16)',
          gridLine: 'rgb(26 15 13 / 0.07)',
          strokeFaint: 'rgb(26 15 13 / 0.22)',
        },
      },
    },

    sakura: {
      id: 'sakura',
      label: { zh: '樱色', en: 'Sakura' },
      colors: {
        dark: {
          ink: '#120a12',
          ink2: '#1e1420',
          paper: '#faf2f8',
          dim: '#c6a8be',
          accent: '#f472b6',
          accent2: '#a78bfa',
          amber: '#fde047',
          line: 'rgb(250 242 248 / 0.16)',
          gridLine: 'rgb(250 242 248 / 0.07)',
          strokeFaint: 'rgb(250 242 248 / 0.24)',
        },
        light: {
          ink: '#fcf6fa',
          ink2: '#f5ecf2',
          paper: '#1a0f18',
          dim: '#8f6f87',
          accent: '#db2777',
          accent2: '#7c3aed',
          amber: '#a16207',
          line: 'rgb(26 15 24 / 0.16)',
          gridLine: 'rgb(26 15 24 / 0.07)',
          strokeFaint: 'rgb(26 15 24 / 0.22)',
        },
      },
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

  steam: {
    enabled: true,
    // SteamID64 / 自定义 URL 名 / 完整主页链接都可以
    steamId: '76561199319113394',
    refreshSeconds: 60,
    apiBase: '/api/steam',
  },

  netease: {
    enabled: true,
    uid: 0,  // 替换为你的网易云音乐用户 ID
    playlistIds: [],  // 替换为你的推荐歌单 ID 列表
    refreshSeconds: 60,
    apiBase: '/api/netease',
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
      'steam.title': 'Steam 动态',
      'steam.loading': '正在连接 Steam…',
      'steam.error': '暂时拿不到 Steam 数据',
      'steam.private': '该资料为私密状态',
      'steam.playing': '正在游玩',
      'steam.recent': '最近两周',
      'steam.top': '游玩最多',
      'steam.noRecent': '最近两周没有游玩记录',
      'steam.level': '等级',
      'steam.games': '游戏',
      'steam.total': '总时长',
      'steam.twoWeeks': '两周',
      'steam.refresh': '立即刷新',
      'steam.profileLink': '打开 Steam 主页',
      'steam.updated': '更新于',
      'steam.state.offline': '离线',
      'steam.state.online': '在线',
      'steam.state.busy': '忙碌',
      'steam.state.away': '离开',
      'steam.state.snooze': '打盹',
      'steam.state.trade': '想交易',
      'steam.state.play': '想玩游戏',
      'netease.title': '网易云音乐',
      'netease.loading': '正在连接…',
      'netease.error': '暂时拿不到数据',
      'netease.playing': '正在听',
      'netease.recent': '最近在听',
      'netease.noRecent': '最近没有听歌记录',
      'netease.refresh': '立即刷新',
      'netease.profileLink': '打开网易云主页',
      'netease.updated': '更新于',
      'netease.search': '搜索歌曲或歌手…',
      'netease.noResults': '没有找到相关歌曲',
      'netease.playlists': '推荐歌单',
      'netease.lyrics': '歌词',
      'netease.noLyrics': '暂无歌词',
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
      'steam.title': 'Steam activity',
      'steam.loading': 'Connecting to Steam…',
      'steam.error': 'Steam data unavailable',
      'steam.private': 'This profile is private',
      'steam.playing': 'Now playing',
      'steam.recent': 'Last 2 weeks',
      'steam.top': 'Most played',
      'steam.noRecent': 'Nothing played in the last 2 weeks',
      'steam.level': 'Level',
      'steam.games': 'games',
      'steam.total': 'total',
      'steam.twoWeeks': '2 weeks',
      'steam.refresh': 'Refresh now',
      'steam.profileLink': 'Open Steam profile',
      'steam.updated': 'updated',
      'steam.state.offline': 'Offline',
      'steam.state.online': 'Online',
      'steam.state.busy': 'Busy',
      'steam.state.away': 'Away',
      'steam.state.snooze': 'Snooze',
      'steam.state.trade': 'Looking to trade',
      'steam.state.play': 'Looking to play',
      'netease.title': 'NetEase Music',
      'netease.loading': 'Connecting…',
      'netease.error': 'Data unavailable',
      'netease.playing': 'Now playing',
      'netease.recent': 'Recently played',
      'netease.noRecent': 'No recent plays',
      'netease.refresh': 'Refresh now',
      'netease.profileLink': 'Open NetEase profile',
      'netease.updated': 'updated',
      'netease.search': 'Search songs or artists…',
      'netease.noResults': 'No songs found',
      'netease.playlists': 'Playlists',
      'netease.lyrics': 'Lyrics',
      'netease.noLyrics': 'No lyrics available',
      'footer.tagline': 'I am a PlaceHolder',
      'footer.built': 'Built with React · GSAP · Tailwind · Bun.',
    },
  },
}
