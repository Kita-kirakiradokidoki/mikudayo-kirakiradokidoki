import { useState, useEffect, useMemo } from 'react'
import { LangProvider, useLang } from './i18n'
import { ThemeProvider } from './theme'
import { POSTS } from './data/posts'
import { ScrollTrigger } from './lib/gsap'
import TopBar from './components/TopBar'
import Hero from './components/Hero'
import CommentMarquee from './components/CommentMarquee'
import TagFilter from './components/TagFilter'
import PostCard from './components/PostCard'
import PostView from './components/PostView'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'
import ScrollProgress from './components/ScrollProgress'
import GridSpotlight from './components/GridSpotlight'
import Background from './components/Background'
import FloatingPlayer from './components/FloatingPlayer'
import { AudioProvider, useBgm } from './components/AudioProvider'
import { SITE_CONFIG } from './site.config'

function Shell() {
  const { lang } = useLang()
  const { setActive, setTrack } = useBgm()
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(
    () => [...new Set(POSTS.flatMap((p) => p.tags))].sort(),
    [],
  )
  const filteredPosts = useMemo(
    () => (activeTag ? POSTS.filter((p) => p.tags.includes(activeTag)) : POSTS),
    [activeTag],
  )

  const post = selectedPost ? POSTS.find((p) => p.id === selectedPost) ?? null : null

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [lang])

  useEffect(() => {
    setActive(selectedPost === null)
  }, [selectedPost, setActive])

  // clear any article track override when the page changes
  useEffect(() => {
    setTrack(null)
  }, [post, setTrack])

  useEffect(() => {
    const postId = window.location.hash.slice(1).split(':')[0]
    if (!postId) return
    if (POSTS.some((p) => p.id === postId)) {
      setSelectedPost(postId)
    }
  }, [])

  useEffect(() => {
    if (selectedPost) {
      window.location.hash = selectedPost
    } else {
      window.location.hash = ''
    }
  }, [selectedPost])

  const layout = (
    <>
      <TopBar />
      <main>
        {post ? (
          <PostView post={post} onBack={() => setSelectedPost(null)} />
        ) : (
          <>
            <Hero />
            <CommentMarquee />
            <div id="posts" className="mx-auto w-full max-w-7xl px-4 pb-16 md:pb-28">
              <div className="border-line border-t pt-6">
                <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
              </div>
              <div className="border-line border-t" />
              {filteredPosts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onSelect={() => setSelectedPost(p.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  )

  return (
    <div className={`${SITE_CONFIG.grid.enabled ? 'bg-blueprint' : ''} min-h-[100dvh]`}>
      <Background />
      {layout}
      <FloatingPlayer />
      <GridSpotlight />
      <ScrollProgress />
      <CursorGlow />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AudioProvider>
          <Shell />
        </AudioProvider>
      </LangProvider>
    </ThemeProvider>
  )
}
