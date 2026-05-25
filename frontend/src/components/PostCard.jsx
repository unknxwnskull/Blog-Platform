import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function PostCard({ post, variant = 'default' }) {
  const date = post.published_at || post.created_at

  if (variant === 'featured') {
    return (
      <article className="group grid md:grid-cols-2 gap-0 card overflow-hidden">
        {post.cover_image && (
          <div className="aspect-video md:aspect-auto overflow-hidden">
            <img src={post.cover_image} alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-8 flex flex-col justify-between">
          <div>
            {post.category_name && (
              <Link to={`/?category=${post.category_slug}`}
                className="inline-block text-xs font-sans font-medium uppercase tracking-widest text-accent mb-3 hover:text-accent-dark">
                {post.category_name}
              </Link>
            )}
            <Link to={`/post/${post.slug}`}>
              <h2 className="font-display text-2xl font-bold text-ink-900 leading-snug mb-3 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="font-body text-sm text-ink-600 leading-relaxed line-clamp-3 mb-4">
                {post.excerpt}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-ink-200 flex items-center justify-center overflow-hidden">
                {post.author_avatar
                  ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="font-sans text-xs text-ink-600">{post.author_username?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div>
                <Link to={`/profile/${post.author_username}`}
                  className="font-sans text-xs font-medium text-ink-800 hover:text-accent">
                  {post.author_name || post.author_username}
                </Link>
                <p className="font-sans text-xs text-ink-400">
                  {date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-ink-400 text-xs font-sans">
              <span className="flex items-center gap-1"><Clock size={12} /> {post.reading_time}m</span>
              <span className="flex items-center gap-1"><Heart size={12} /> {post.likes_count || 0}</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group card flex flex-col overflow-hidden">
      {post.cover_image && (
        <div className="aspect-video overflow-hidden">
          <img src={post.cover_image} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        {post.category_name && (
          <Link to={`/?category=${post.category_slug}`}
            className="text-xs font-sans font-medium uppercase tracking-widest text-accent hover:text-accent-dark mb-1">
            {post.category_name}
          </Link>
        )}
        <Link to={`/post/${post.slug}`}>
          <h3 className="font-display text-lg font-bold text-ink-900 leading-snug mt-1 mb-2
                         group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="font-body text-sm text-ink-500 leading-relaxed line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map(t => (
              <span key={t.slug} className="tag-pill">{t.name}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-ink-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-ink-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {post.author_avatar
                ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                : <span className="font-sans text-xs text-ink-600">{post.author_username?.[0]?.toUpperCase()}</span>
              }
            </div>
            <Link to={`/profile/${post.author_username}`}
              className="font-sans text-xs font-medium text-ink-700 hover:text-accent truncate">
              {post.author_name || post.author_username}
            </Link>
          </div>
          <div className="flex items-center gap-2.5 text-ink-400 text-xs font-sans flex-shrink-0">
            <span className="flex items-center gap-1"><Clock size={11} />{post.reading_time}m</span>
            <span className="flex items-center gap-1"><Heart size={11} />{post.likes_count || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle size={11} />{post.comments_count || 0}</span>
          </div>
        </div>
      </div>
    </article>
  )
}