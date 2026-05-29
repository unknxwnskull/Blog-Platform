import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, MessageSquare, Tag, TrendingUp,
  Eye, Heart, Trash2, Shield, Plus, X, ChevronRight, Activity,
  BookOpen, AlertCircle, Check, Search, LogOut
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { usersAPI, categoriesAPI, postsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [showCatForm, setShowCatForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    if (user.role !== 'admin') { navigate('/'); return }
    fetchAll()
  }, [authLoading, user, navigate])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, postsRes, catsRes] = await Promise.all([
        usersAPI.getDashboardStats(),
        usersAPI.getAll(),
        postsAPI.getAll({ limit: 50, status: 'published' }),
        categoriesAPI.getAll(),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users)
      setPosts(postsRes.data.posts)
      setCategories(catsRes.data.categories)
    } catch { toast.error('Failed to load dashboard data') }
    finally { setLoading(false) }
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return
    try {
      await postsAPI.delete(id)
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Post deleted')
    } catch { toast.error('Failed') }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await categoriesAPI.delete(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success('Category deleted')
    } catch { toast.error('Failed') }
  }

  const createCategory = async () => {
    if (!newCategory.name.trim()) { toast.error('Name required'); return }
    try {
      const r = await categoriesAPI.create(newCategory)
      setCategories(prev => [...prev, r.data.category])
      setNewCategory({ name: '', description: '' })
      setShowCatForm(false)
      toast.success('Category created!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author_username?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'categories', label: 'Categories', icon: Tag },
  ]

  if (authLoading || loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-400 flex items-center justify-center">
              <Shield size={14} className="text-gray-950" />
            </div>
            <span className="font-bold text-sm tracking-wide text-white">ADMIN PANEL</span>
            <span className="text-gray-600 text-xs">/ Inkwell</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <BookOpen size={13} /> View Site
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-950">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-xs text-gray-300">{user?.username}</span>
            </div>
            <button onClick={() => { logout(); navigate('/') }}
              className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your blogging platform</p>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 mb-8 border-b border-gray-800">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery('') }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Posts', value: stats.total_posts, sub: `${stats.published} published`, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Total Users', value: stats.total_users, sub: 'registered accounts', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Total Views', value: Number(stats.total_views).toLocaleString(), sub: 'across all posts', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'Comments', value: stats.total_comments, sub: 'reader responses', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              ].map(card => (
                <div key={card.label} className="bg-gray-900 border border-gray-800 p-5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <card.icon size={15} className={card.color} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Post status breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Activity size={16} className="text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Post Status Breakdown</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Published', value: stats.published, color: 'bg-emerald-400', total: stats.total_posts },
                    { label: 'Drafts', value: stats.drafts, color: 'bg-amber-400', total: stats.total_posts },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-medium">{item.value || 0}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: item.total > 0 ? `${((item.value || 0) / item.total) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent posts */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Recent Posts</h3>
                  </div>
                  <button onClick={() => setActiveTab('posts')}
                    className="text-xs text-gray-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-3">
                  {(stats.recent_posts || []).map(post => (
                    <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
                      <div className="min-w-0 flex-1">
                        <Link to={`/post/${post.slug}`}
                          className="text-sm text-gray-300 hover:text-amber-400 transition-colors truncate block">
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-600 mt-0.5">by @{post.author_username}</p>
                      </div>
                      <span className={`ml-3 text-xs px-2 py-0.5 rounded-full flex-shrink-0
                        ${post.status === 'published' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                        {post.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── POSTS ── */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">{filteredPosts.length} posts</p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="bg-gray-900 border border-gray-800 text-sm text-gray-300 pl-9 pr-4 py-2 rounded-lg
                             focus:outline-none focus:border-amber-400/50 placeholder:text-gray-600 w-56" />
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Views</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredPosts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">No posts found</td></tr>
                  ) : filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <Link to={`/post/${post.slug}`}
                          className="text-sm text-gray-200 hover:text-amber-400 transition-colors line-clamp-1 max-w-xs">
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs text-gray-400">@{post.author_username}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs text-gray-500">{post.category_name || '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Eye size={11} /> {post.views || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${post.status === 'published' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => deletePost(post.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">{filteredUsers.length} users</p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="bg-gray-900 border border-gray-800 text-sm text-gray-300 pl-9 pr-4 py-2 rounded-lg
                             focus:outline-none focus:border-amber-400/50 placeholder:text-gray-600 w-56" />
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-600 text-sm">No users found</td></tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-amber-400">{u.username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <Link to={`/profile/${u.username}`}
                              className="text-sm text-gray-200 hover:text-amber-400 transition-colors font-medium">
                              {u.full_name || u.username}
                            </Link>
                            <p className="text-xs text-gray-600">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs text-gray-400">{u.email}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs text-gray-500">
                          {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                          ${u.role === 'admin' ? 'bg-amber-400/15 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">{categories.length} categories</p>
              <button onClick={() => setShowCatForm(!showCatForm)}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                <Plus size={14} /> New Category
              </button>
            </div>

            {/* Create form */}
            {showCatForm && (
              <div className="bg-gray-900 border border-amber-400/30 rounded-lg p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Create Category</h3>
                  <button onClick={() => setShowCatForm(false)} className="text-gray-600 hover:text-gray-400">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={newCategory.name} onChange={e => setNewCategory(p => ({ ...p, name: e.target.value }))}
                    placeholder="Category name"
                    className="bg-gray-800 border border-gray-700 text-sm text-gray-200 px-4 py-2.5 rounded-lg
                               focus:outline-none focus:border-amber-400/50 placeholder:text-gray-600" />
                  <input value={newCategory.description} onChange={e => setNewCategory(p => ({ ...p, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="bg-gray-800 border border-gray-700 text-sm text-gray-200 px-4 py-2.5 rounded-lg
                               focus:outline-none focus:border-amber-400/50 placeholder:text-gray-600" />
                </div>
                <div className="flex justify-end mt-3">
                  <button onClick={createCategory}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    <Check size={13} /> Create
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, i) => {
                const colors = ['border-blue-500/30 bg-blue-500/5', 'border-emerald-500/30 bg-emerald-500/5',
                  'border-purple-500/30 bg-purple-500/5', 'border-amber-500/30 bg-amber-500/5',
                  'border-pink-500/30 bg-pink-500/5', 'border-cyan-500/30 bg-cyan-500/5']
                const dotColors = ['bg-blue-400', 'bg-emerald-400', 'bg-purple-400', 'bg-amber-400', 'bg-pink-400', 'bg-cyan-400']
                return (
                  <div key={cat.id} className={`border rounded-lg p-5 ${colors[i % colors.length]} relative group`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                        <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                      </div>
                      <button onClick={() => deleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{cat.post_count || 0} posts</span>
                      <Link to={`/?category=${cat.slug}`}
                        className="text-xs text-gray-600 hover:text-amber-400 transition-colors flex items-center gap-1">
                        View <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
