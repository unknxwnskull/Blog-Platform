import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, MessageSquare, Tag, TrendingUp,
  Eye, Trash2, Shield, Plus, X, ChevronRight, Activity,
  BookOpen, Check, Search, LogOut, Menu, BarChart2
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { usersAPI, categoriesAPI, postsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [showCatForm, setShowCatForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'admin') { navigate('/'); return }
    fetchAll()
  }, [user])

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

  const handleTabChange = (id) => {
    setActiveTab(id)
    setSearchQuery('')
    setSidebarOpen(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-400 hover:text-white p-1">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-400 flex items-center justify-center rounded">
                <Shield size={14} className="text-gray-950" />
              </div>
              <span className="font-bold text-sm tracking-wide text-white hidden sm:block">ADMIN</span>
              <span className="text-gray-600 text-xs hidden sm:block">/ Inkwell</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-amber-400 transition-colors hidden sm:flex items-center gap-1.5">
              <BookOpen size={13} /> View Site
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gray-950">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-xs text-gray-300 hidden sm:block">{user?.username}</span>
            </div>
            <button onClick={() => { logout(); navigate('/') }}
              className="text-gray-500 hover:text-red-400 transition-colors p-1">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar overlay mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-14 h-[calc(100vh-3.5rem)] w-56 bg-gray-900 border-r border-gray-800
          z-30 flex flex-col transition-transform duration-300 overflow-y-auto flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 px-2">Navigation</p>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-amber-400/10 text-amber-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-gray-800">
            <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-amber-400 transition-colors">
              <BookOpen size={13} /> View Live Site
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-1">
              {(() => { const Icon = tabs.find(t => t.id === activeTab)?.icon; return Icon ? <Icon size={18} className="text-amber-400" /> : null })()}
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
            </div>
            <p className="text-gray-500 text-sm">Manage your blogging platform</p>
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Total Posts', value: stats.total_posts, sub: `${stats.published || 0} published`, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Total Users', value: stats.total_users, sub: 'registered', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { label: 'Total Views', value: Number(stats.total_views || 0).toLocaleString(), sub: 'all posts', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                  { label: 'Comments', value: stats.total_comments, sub: 'responses', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                ].map(card => (
                  <div key={card.label} className="bg-gray-900 border border-gray-800 p-4 md:p-5 rounded-lg">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wider leading-tight">{card.label}</span>
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                        <card.icon size={13} className={card.color} />
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart2 size={16} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Post Status</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Published', value: stats.published || 0, color: 'bg-emerald-400' },
                      { label: 'Drafts', value: stats.drafts || 0, color: 'bg-amber-400' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-white font-medium">{item.value}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                            style={{ width: stats.total_posts > 0 ? `${(item.value / stats.total_posts) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-800">
                    {[
                      { label: 'Categories', value: categories.length },
                      { label: 'Avg Views', value: posts.length > 0 ? Math.round(posts.reduce((a, p) => a + (p.views || 0), 0) / posts.length) : 0 },
                      { label: 'Avg Likes', value: posts.length > 0 ? Math.round(posts.reduce((a, p) => a + (p.likes_count || 0), 0) / posts.length) : 0 },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-lg font-bold text-white">{s.value}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 md:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Recent Posts</h3>
                    </div>
                    <button onClick={() => handleTabChange('posts')}
                      className="text-xs text-gray-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(stats.recent_posts || []).map(post => (
                      <div key={post.id} className="flex items-center justify-between py-2.5 border-b border-gray-800/60 last:border-0 gap-3">
                        <div className="min-w-0 flex-1">
                          <Link to={`/post/${post.slug}`}
                            className="text-sm text-gray-300 hover:text-amber-400 transition-colors truncate block">
                            {post.title}
                          </Link>
                          <p className="text-xs text-gray-600 mt-0.5">@{post.author_username}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0
                          ${post.status === 'published' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                          {post.status}
                        </span>
                      </div>
                    ))}
                    {(!stats.recent_posts || stats.recent_posts.length === 0) && (
                      <p className="text-sm text-gray-600 text-center py-6">No posts yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* POSTS */}
          {activeTab === 'posts' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">{filteredPosts.length} posts</p>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="bg-gray-900 border border-gray-800 text-sm text-gray-300 pl-9 pr-4 py-2 rounded-lg
                               focus:outline-none focus:border-amber-400/50 placeholder:text-gray-600 w-full sm:w-56" />
                </div>
              </div>

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 text-sm bg-gray-900 border border-gray-800 rounded-lg">No posts found</div>
                ) : filteredPosts.map(post => (
                  <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link to={`/post/${post.slug}`}
                          className="text-sm text-gray-200 hover:text-amber-400 transition-colors line-clamp-2 font-medium">
                          {post.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                          <span className="text-xs text-gray-500">@{post.author_username}</span>
                          {post.category_name && <span className="text-xs text-gray-600">{post.category_name}</span>}
                          <span className="text-xs text-gray-600 flex items-center gap-1"><Eye size={10} /> {post.views || 0}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full
                            ${post.status === 'published' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => deletePost(post.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1 flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
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
                              className="text-sm text-gray-200 hover:text-amber-400 transition-colors line-clamp-1 max-w-xs block">
                              {post.title}
                            </Link>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : '—'}
                            </p>
                          </td>
                          <td className="px-5 py-4"><span className="text-xs text-gray-400">@{post.author_username}</span></td>
                          <td className="px-5 py-4"><span className="text-xs text-gray-500">{post.category_name || '—'}</span></td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={11} /> {post.views || 0}</span>
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
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">{filteredUsers.length} users</p>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="bg-gray-900 border border-gray-800 text-sm text-gray-300 pl-9 pr-4 py-2 rounded-lg
                               focus:outline-none focus:border-amber-400/50 placeholder:text-gray-600 w-full sm:w-56" />
                </div>
              </div>

              {/* Mobile cards */}
              <div className="block md:hidden space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 text-sm bg-gray-900 border border-gray-800 rounded-lg">No users found</div>
                ) : filteredUsers.map(u => (
                  <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-amber-400">{u.username[0].toUpperCase()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/profile/${u.username}`}
                          className="text-sm text-gray-200 hover:text-amber-400 font-medium transition-colors">
                          {u.full_name || u.username}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0
                        ${u.role === 'admin' ? 'bg-amber-400/15 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 ml-12">
                      Joined {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
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
                        <td className="px-5 py-4"><span className="text-xs text-gray-400">{u.email}</span></td>
                        <td className="px-5 py-4">
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

          {/* CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">{categories.length} categories</p>
                <button onClick={() => setShowCatForm(!showCatForm)}
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                  <Plus size={14} /> New Category
                </button>
              </div>

              {showCatForm && (
                <div className="bg-gray-900 border border-amber-400/30 rounded-lg p-4 md:p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Create Category</h3>
                    <button onClick={() => setShowCatForm(false)} className="text-gray-600 hover:text-gray-400"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {categories.map((cat, i) => {
                  const colors = ['border-blue-500/30 bg-blue-500/5','border-emerald-500/30 bg-emerald-500/5','border-purple-500/30 bg-purple-500/5','border-amber-500/30 bg-amber-500/5','border-pink-500/30 bg-pink-500/5','border-cyan-500/30 bg-cyan-500/5']
                  const dotColors = ['bg-blue-400','bg-emerald-400','bg-purple-400','bg-amber-400','bg-pink-400','bg-cyan-400']
                  return (
                    <div key={cat.id} className={`border rounded-lg p-4 md:p-5 ${colors[i % colors.length]} relative group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[i % dotColors.length]}`} />
                          <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                        </div>
                        <button onClick={() => deleteCategory(cat.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {cat.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2 ml-4">{cat.description}</p>}
                      <div className="flex items-center justify-between ml-4">
                        <span className="text-xs text-gray-600">{cat.post_count || 0} posts</span>
                        <Link to={`/?category=${cat.slug}`}
                          className="text-xs text-gray-600 hover:text-amber-400 transition-colors flex items-center gap-1">
                          View <ChevronRight size={11} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
                {categories.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-600 text-sm">No categories yet. Create one above!</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}