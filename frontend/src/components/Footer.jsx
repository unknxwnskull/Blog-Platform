import { Link, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <footer className={`${isAdmin ? 'border-gray-800 bg-gray-950 mt-0' : 'border-ink-200 bg-white mt-16'} border-t`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen size={18} className={isAdmin ? 'text-amber-400' : 'text-accent'} />
            <span className={`font-display text-lg font-bold ${isAdmin ? 'text-gray-100' : 'text-ink-900'}`}>Inkwell</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className={`font-sans text-xs ${isAdmin ? 'text-gray-500 hover:text-amber-400' : 'text-ink-500 hover:text-ink-900'}`}>Home</Link>
            <Link to="/categories" className={`font-sans text-xs ${isAdmin ? 'text-gray-500 hover:text-amber-400' : 'text-ink-500 hover:text-ink-900'}`}>Topics</Link>
            <Link to="/write" className={`font-sans text-xs ${isAdmin ? 'text-gray-500 hover:text-amber-400' : 'text-ink-500 hover:text-ink-900'}`}>Write</Link>
          </nav>
          <p className={`font-sans text-xs ${isAdmin ? 'text-gray-600' : 'text-ink-400'}`}>
            © {new Date().getFullYear()} Inkwell
          </p>
        </div>
      </div>
    </footer>
  )
}
