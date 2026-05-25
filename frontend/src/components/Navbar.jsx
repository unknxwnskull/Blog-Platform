import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, PenSquare, BookOpen, Menu, X, User, LogOut, Bookmark, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-ink-50 border-b border-ink-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <BookOpen size={22} className="text-accent" />
            <span className="font-display text-xl font-bold text-ink-900 group-hover:text-accent transition-colors">
              Inkwell
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="btn-ghost">Home</Link>
            <Link to="/categories" className="btn-ghost">Topics</Link>
            {user && <Link to="/bookmarks" className="btn-ghost">Bookmarks</Link>}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="input-field w-48 py-1.5 text-sm"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="btn-ghost p-2">
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="btn-ghost p-2">
                <Search size={18} />
              </button>
            )}

            {user ? (
              <>
                <Link to="/write" className="hidden md:flex btn-primary items-center gap-1.5 text-xs">
                  <PenSquare size={14} /> Write
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-ink-300 hover:border-accent transition-colors flex items-center justify-center bg-ink-200"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-sans text-xs font-semibold text-ink-700">
                        {user.username[0].toUpperCase()}
                      </span>
                    )}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-ink-200 shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-ink-100">
                        <p className="font-sans text-sm font-medium text-ink-900">{user.full_name || user.username}</p>
                        <p className="font-sans text-xs text-ink-500">@{user.username}</p>
                      </div>
                      <Link to={`/profile/${user.username}`} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-sans text-ink-700 hover:bg-ink-50">
                        <User size={14} /> My Profile
                      </Link>
                      <Link to="/write" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-sans text-ink-700 hover:bg-ink-50">
                        <PenSquare size={14} /> Write Article
                      </Link>
                      <Link to="/bookmarks" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-sans text-ink-700 hover:bg-ink-50">
                        <Bookmark size={14} /> Bookmarks
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-sans text-ink-700 hover:bg-ink-50">
                          <LayoutDashboard size={14} /> Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-ink-100">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-sans text-accent hover:bg-accent/5">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-xs">Get Started</Link>
              </div>
            )}

            <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-ink-200 py-4 space-y-1">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 font-sans text-sm text-ink-700 hover:bg-ink-100">Home</Link>
            <Link to="/categories" onClick={() => setMenuOpen(false)} className="block px-4 py-2 font-sans text-sm text-ink-700 hover:bg-ink-100">Topics</Link>
            {user && (
              <>
                <Link to="/write" onClick={() => setMenuOpen(false)} className="block px-4 py-2 font-sans text-sm text-ink-700 hover:bg-ink-100">Write Article</Link>
                <Link to="/bookmarks" onClick={() => setMenuOpen(false)} className="block px-4 py-2 font-sans text-sm text-ink-700 hover:bg-ink-100">Bookmarks</Link>
              </>
            )}
          </div>
        )}
      </div>
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
    </header>
  )
}