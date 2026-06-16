import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Edit, FileText, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { postsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function DraftsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    postsAPI.getAll({ status: 'draft', limit: 100 })
      .then(r => setPosts(r.data.posts))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <FileText size={40} className="mx-auto text-ink-300 mb-4" />
      <p className="font-display text-xl text-ink-700">Sign in to see your drafts</p>
      <Link to="/login" className="btn-primary inline-block mt-6">Sign In</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-accent" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Drafts</h1>
            <p className="font-sans text-sm text-ink-500">{posts.length} unpublished articles</p>
          </div>
        </div>
        <Link to="/write" className="btn-primary inline-flex items-center gap-1.5 text-xs">
          <Plus size={13} /> New Article
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-ink-200 rounded mb-3 w-2/3" />
              <div className="h-4 bg-ink-100 rounded mb-2 w-full" />
              <div className="h-4 bg-ink-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={40} className="mx-auto text-ink-200 mb-4" />
          <p className="font-display text-xl text-ink-500">No drafts yet</p>
          <p className="font-sans text-sm text-ink-400 mt-2">Saved drafts will appear here.</p>
          <Link to="/write" className="btn-primary inline-block mt-6">Write Article</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <article key={post.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold text-ink-900 truncate">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="font-body text-sm text-ink-500 mt-1 line-clamp-2">{post.excerpt}</p>
                )}
                <p className="font-sans text-xs text-ink-400 mt-3">
                  Last saved {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : ''}
                </p>
              </div>
              <Link to={`/edit/${post.id}`} className="btn-outline inline-flex items-center justify-center gap-1.5 text-xs flex-shrink-0">
                <Edit size={13} /> Edit
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
