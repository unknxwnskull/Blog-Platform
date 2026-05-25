import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen size={18} className="text-accent" />
            <span className="font-display text-lg font-bold text-ink-900">Inkwell</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="font-sans text-xs text-ink-500 hover:text-ink-900">Home</Link>
            <Link to="/categories" className="font-sans text-xs text-ink-500 hover:text-ink-900">Topics</Link>
            <Link to="/write" className="font-sans text-xs text-ink-500 hover:text-ink-900">Write</Link>
          </nav>
          <p className="font-sans text-xs text-ink-400">
            © {new Date().getFullYear()} Inkwell. Built with React & Node.js
          </p>
        </div>
      </div>
    </footer>
  )
}