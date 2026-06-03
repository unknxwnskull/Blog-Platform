import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Bookmark, Clock, Eye, MessageCircle, Share2, Edit, Trash2, Send } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'
import { postsAPI, commentsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function PostPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    postsAPI.getBySlug(slug)
      .then(r => {
        const p = r.data.post
        setPost(p)
        setLiked(p.liked_by_user || false)
        setBookmarked(p.bookmarked_by_user || false)
        setLikesCount(p.likes_count || 0)
        return commentsAPI.getByPost(p.id)
      })
      .then(r => setComments(r.data.comments))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug])

  const toggleLike = async () => {
    if (!user) { toast.error('Sign in to like posts'); return }
    const r = await postsAPI.toggleLike(post.id)
    setLiked(r.data.liked)
    setLikesCount(prev => r.data.liked ? prev + 1 : prev - 1)
  }

  const toggleBookmark = async () => {
    if (!user) { toast.error('Sign in to bookmark'); return }
    const r = await postsAPI.toggleBookmark(post.id)
    setBookmarked(r.data.bookmarked)
    toast.success(r.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed')
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to comment'); return }
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const r = await commentsAPI.create(post.id, { content: comment, parent_id: replyTo?.id || null })
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo.id ? { ...c, replies: [...c.replies, r.data.comment] } : c
        ))
      } else {
        setComments(prev => [...prev, r.data.comment])
      }
      setComment(''); setReplyTo(null)
      toast.success('Comment posted!')
    } catch { toast.error('Failed to post comment') }
    finally { setSubmitting(false) }
  }

  const deletePost = async () => {
    await postsAPI.delete(post.id)
    toast.success('Post deleted')
    navigate('/')
  }

  const deleteComment = async (id) => {
    await commentsAPI.delete(id)
    setComments(prev => prev.filter(c => c.id !== id).map(c => ({
      ...c, replies: c.replies.filter(r => r.id !== id)
    })))
    toast.success('Comment deleted')
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-ink-200 rounded mb-4 w-3/4" />
      <div className="h-4 bg-ink-100 rounded mb-2 w-1/2" />
      <div className="h-64 bg-ink-100 rounded mt-8" />
    </div>
  )
  if (!post) return null

  const date = post.published_at || post.created_at
  const isAuthor = user?.id === post.author_id
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen">
      {post.cover_image && (
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
     <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <div className="flex flex-wrap gap-2 mb-5">
          {post.category_name && (
            <Link to={`/?category=${post.category_slug}`}
              className="text-xs font-sans font-medium uppercase tracking-widest text-accent hover:text-accent-dark">
              {post.category_name}
            </Link>
          )}
          {post.tags?.map(t => <span key={t.slug} className="tag-pill">{t.name}</span>)}
        </div>

       <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink-900 leading-tight mb-5 md:mb-6">
          {post.title}
        </h1>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-ink-200">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author_username}`}>
              <div className="w-10 h-10 rounded-full bg-ink-200 overflow-hidden flex items-center justify-center">
                {post.author_avatar
                  ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="font-sans font-semibold text-ink-600">{post.author_username?.[0]?.toUpperCase()}</span>
                }
              </div>
            </Link>
            <div>
              <Link to={`/profile/${post.author_username}`}
                className="font-sans text-sm font-medium text-ink-900 hover:text-accent">
                {post.author_name || post.author_username}
              </Link>
              <p className="font-sans text-xs text-ink-400">
                {date ? format(new Date(date), 'MMM d, yyyy') : ''} · {post.reading_time} min read · {post.views} views
              </p>
            </div>
          </div>
          {(isAuthor || isAdmin) && (
            <div className="flex items-center gap-2">
              {isAuthor && (
                <Link to={`/edit/${post.id}`} className="btn-ghost flex items-center gap-1 text-xs">
                  <Edit size={12} /> Edit
                </Link>
              )}
              <button onClick={() => setShowDeleteModal(true)}
                className="btn-ghost flex items-center gap-1 text-xs text-accent">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="prose-content mb-10" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Actions */}
        <div className="flex items-center justify-between py-5 border-t border-b border-ink-200 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={toggleLike}
              className={`flex items-center gap-2 font-sans text-sm transition-colors
                ${liked ? 'text-accent' : 'text-ink-500 hover:text-accent'}`}>
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {likesCount}
            </button>
            <button onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 font-sans text-sm text-ink-500">
              <MessageCircle size={18} /> {comments.length}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleBookmark}
              className={`flex items-center gap-1.5 font-sans text-sm transition-colors
                ${bookmarked ? 'text-accent' : 'text-ink-500 hover:text-accent'}`}>
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!') }}
              className="btn-ghost flex items-center gap-1 text-xs">
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* Author bio */}
        {post.author_bio && (
          <div className="bg-ink-100 p-6 mb-10 border-l-4 border-accent">
            <p className="font-sans text-xs uppercase tracking-widest text-ink-500 mb-2">About the author</p>
            <Link to={`/profile/${post.author_username}`}
              className="font-display text-lg font-bold text-ink-900 hover:text-accent">
              {post.author_name || post.author_username}
            </Link>
            <p className="font-body text-sm text-ink-600 mt-2">{post.author_bio}</p>
          </div>
        )}

        {/* Comments */}
        <section id="comments">
          <h2 className="font-display text-2xl font-bold text-ink-900 mb-6">
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </h2>
          <form onSubmit={submitComment} className="mb-8 p-5 card">
            {replyTo && (
              <div className="flex items-center justify-between mb-3 bg-ink-100 px-3 py-2 text-xs font-sans text-ink-600">
                Replying to <strong>@{replyTo.author_username}</strong>
                <button type="button" onClick={() => setReplyTo(null)} className="hover:text-accent">✕</button>
              </div>
            )}
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder={user ? 'Share your thoughts...' : 'Sign in to comment...'}
              disabled={!user} rows={3} className="input-field resize-none mb-3" />
            <div className="flex justify-end">
              <button type="submit" disabled={!user || submitting || !comment.trim()}
                className="btn-primary flex items-center gap-2 text-xs disabled:opacity-50">
                <Send size={13} /> {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
          <div className="space-y-6">
            {comments.map(c => (
              <CommentItem key={c.id} comment={c} user={user}
                onReply={setReplyTo} onDelete={deleteComment} />
            ))}
          </div>
        </section>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-sm w-full">
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">Delete post?</h3>
            <p className="font-sans text-sm text-ink-600 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={deletePost} className="btn-primary bg-accent hover:bg-accent-dark flex-1">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment, user, onReply, onDelete, nested = false }) {
  const canDelete = user?.id === comment.author_id || user?.role === 'admin'
  return (
    <div className={nested ? 'ml-8 pl-5 border-l-2 border-ink-200' : ''}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-ink-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {comment.author_avatar
            ? <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />
            : <span className="font-sans text-xs font-semibold text-ink-600">{comment.author_username?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-sm font-medium text-ink-900">{comment.author_name || comment.author_username}</span>
            <span className="font-sans text-xs text-ink-400">
              {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : ''}
            </span>
          </div>
          <p className="font-body text-sm text-ink-700 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            {user && !nested && (
              <button onClick={() => onReply(comment)} className="font-sans text-xs text-ink-400 hover:text-accent">Reply</button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(comment.id)} className="font-sans text-xs text-ink-400 hover:text-accent">Delete</button>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(r => (
            <CommentItem key={r.id} comment={r} user={user} onReply={onReply} onDelete={onDelete} nested />
          ))}
        </div>
      )}
    </div>
  )
}