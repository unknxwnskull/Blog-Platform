import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BookOpen, Eye, Heart, Calendar, Edit3 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { usersAPI, authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'

export default function ProfilePage() {
  const { username } = useParams()
  const { user: currentUser, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const isOwn = currentUser?.username === username

  useEffect(() => {
    setLoading(true)
    usersAPI.getProfile(username)
      .then(r => {
        setProfile(r.data.user)
        setPosts(r.data.posts)
        setStats(r.data.stats)
        setEditForm({ full_name: r.data.user.full_name || '', bio: r.data.user.bio || '', avatar_url: r.data.user.avatar_url || '' })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [username])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const r = await authAPI.updateProfile(editForm)
      setProfile(r.data.user)
      updateUser(r.data.user)
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
      <div className="flex gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-ink-200" />
        <div className="flex-1"><div className="h-6 bg-ink-200 rounded w-48 mb-2" /><div className="h-4 bg-ink-100 rounded w-32" /></div>
      </div>
    </div>
  )
  if (!profile) return <div className="text-center py-20 font-sans text-ink-500">User not found</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-10 pb-10 border-b border-ink-200">
        <div className="w-20 h-20 rounded-full bg-ink-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            : <span className="font-display text-3xl font-bold text-ink-600">{profile.username[0].toUpperCase()}</span>
          }
        </div>
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3 max-w-md">
              <input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                className="input-field" placeholder="Full name" />
              <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                className="input-field resize-none" rows={3} placeholder="Short bio..." />
              <input value={editForm.avatar_url} onChange={e => setEditForm(p => ({ ...p, avatar_url: e.target.value }))}
                className="input-field" placeholder="Avatar URL" />
              <div className="flex gap-2">
                <button onClick={saveProfile} disabled={saving} className="btn-primary text-xs">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="btn-outline text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl font-bold text-ink-900">{profile.full_name || profile.username}</h1>
                {isOwn && <button onClick={() => setEditing(true)} className="btn-ghost p-1.5"><Edit3 size={14} /></button>}
              </div>
              <p className="font-sans text-sm text-ink-500 mb-3">@{profile.username}</p>
              {profile.bio && <p className="font-body text-sm text-ink-700 mb-3 max-w-lg">{profile.bio}</p>}
              <p className="font-sans text-xs text-ink-400 flex items-center gap-1">
                <Calendar size={11} /> Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
              </p>
            </>
          )}
        </div>
        {stats && (
          <div className="flex gap-6 flex-shrink-0">
            {[
              { icon: BookOpen, label: 'Posts', val: stats.total_posts },
              { icon: Eye, label: 'Views', val: stats.total_views },
              { icon: Heart, label: 'Likes', val: stats.total_likes },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="text-center">
                <p className="font-display text-xl font-bold text-ink-900">{Number(val).toLocaleString()}</p>
                <p className="font-sans text-xs text-ink-500 flex items-center gap-1 justify-center mt-0.5">
                  <Icon size={10} /> {label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="font-display text-xl font-bold text-ink-900 mb-6">
        {isOwn ? 'Your Articles' : `Articles by ${profile.full_name || profile.username}`}
      </h2>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-sans text-ink-400">No published articles yet.</p>
          {isOwn && <Link to="/write" className="btn-primary inline-block mt-4">Write your first article</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}