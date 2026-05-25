
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Hash } from 'lucide-react'
import { postsAPI, categoriesAPI } from '../utils/api'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'

export function BookmarksPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    postsAPI.getBookmarks()
      .then(r => setPosts(r.data.posts))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <Bookmark size={40} className="mx-auto text-ink-300 mb-4" />
      <p className="font-display text-xl text-ink-700">Sign in to see your bookmarks</p>
      <Link to="/login" className="btn-primary inline-block mt-6">Sign In</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark size={22} className="text-accent" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Bookmarks</h1>
          <p className="font-sans text-sm text-ink-500">{posts.length} saved articles</p>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-ink-200 rounded mb-3 w-1/3" />
              <div className="h-6 bg-ink-200 rounded mb-2" />
              <div className="h-4 bg-ink-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark size={40} className="mx-auto text-ink-200 mb-4" />
          <p className="font-display text-xl text-ink-500">No bookmarks yet</p>
          <p className="font-sans text-sm text-ink-400 mt-2">Save articles you love for later</p>
          <Link to="/" className="btn-primary inline-block mt-6">Browse Articles</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}

export function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesAPI.getAll()
      .then(r => setCategories(r.data.categories))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const colors = ['bg-ink-900', 'bg-accent', 'bg-ink-700', 'bg-ink-500', 'bg-ink-800', 'bg-accent-dark']

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Hash size={22} className="text-accent" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Explore Topics</h1>
          <p className="font-sans text-sm text-ink-500">Browse articles by category</p>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-ink-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <Link key={cat.id} to={`/?category=${cat.slug}`}
              className={`${colors[i % colors.length]} p-6 text-white group hover:opacity-90 transition-opacity`}>
              <h3 className="font-display text-xl font-bold mb-1">{cat.name}</h3>
              {cat.description && <p className="font-sans text-xs text-white/70 mb-3 line-clamp-2">{cat.description}</p>}
              <p className="font-sans text-xs text-white/60">{cat.post_count || 0} articles</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}