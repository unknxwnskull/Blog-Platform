import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { postsAPI, categoriesAPI } from '../utils/api'
import PostCard from '../components/PostCard'
import { ChevronLeft, ChevronRight, Feather } from 'lucide-react'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState({ total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)

  const page = Number(searchParams.get('page')) || 1
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 9, status: 'published' }
    if (category) params.category = category
    if (search) params.search = search
    postsAPI.getAll(params)
      .then(r => { setPosts(r.data.posts); setMeta({ total: r.data.total, pages: r.data.pages }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, category, search])

  const featuredPost = posts[0]
  const restPosts = posts.slice(1)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Hero */}
      {!category && !search && page === 1 && (
        <div className="mb-10 fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-px h-8 bg-accent" />
            <p className="font-sans text-xs uppercase tracking-widest text-ink-500">Featured Publication</p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink-900 leading-tight max-w-2xl">
            Stories worth <span className="italic text-accent">reading.</span>
          </h1>
        </div>
      )}

      {/* Search heading */}
      {search && (
        <div className="mb-8 fade-up">
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Results for <span className="italic text-accent">"{search}"</span>
          </h2>
          <p className="font-sans text-sm text-ink-500 mt-1">{meta.total} articles found</p>
          <button onClick={() => setSearchParams({})} className="btn-ghost text-xs mt-2 pl-0">← Clear search</button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8">
        <button onClick={() => setSearchParams({})}
          className={`flex-shrink-0 text-xs font-sans font-medium px-4 py-2 border transition-colors
            ${!category ? 'bg-ink-900 text-ink-50 border-ink-900' : 'border-ink-300 text-ink-600 hover:border-ink-600'}`}>
          All Topics
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSearchParams({ category: cat.slug })}
            className={`flex-shrink-0 text-xs font-sans font-medium px-4 py-2 border transition-colors
              ${category === cat.slug ? 'bg-ink-900 text-ink-50 border-ink-900' : 'border-ink-300 text-ink-600 hover:border-ink-600'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-40 bg-ink-100 mb-4" />
              <div className="h-4 bg-ink-200 rounded mb-3 w-1/3" />
              <div className="h-6 bg-ink-200 rounded mb-2" />
              <div className="h-4 bg-ink-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <Feather size={40} className="mx-auto text-ink-300 mb-4" />
          <p className="font-display text-xl text-ink-500">No articles found</p>
          <p className="font-sans text-sm text-ink-400 mt-2">Be the first to write about this topic!</p>
          <Link to="/write" className="btn-primary inline-block mt-6">Write Article</Link>
        </div>
      ) : (
        <>
          {!category && !search && page === 1 && featuredPost && (
            <div className="mb-10 fade-up">
              <PostCard post={featuredPost} variant="featured" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((!category && !search && page === 1) ? restPosts : posts).map((post, i) => (
              <div key={post.id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-14">
              <button
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', page - 1); setSearchParams(p) }}
                disabled={page === 1}
                className="btn-outline flex items-center gap-1 text-xs disabled:opacity-40">
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="font-sans text-sm text-ink-500">{page} / {meta.pages}</span>
              <button
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', page + 1); setSearchParams(p) }}
                disabled={page >= meta.pages}
                className="btn-outline flex items-center gap-1 text-xs disabled:opacity-40">
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}