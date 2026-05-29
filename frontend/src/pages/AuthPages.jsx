import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.identifier, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ink-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <BookOpen size={24} className="text-accent" />
            <span className="font-display text-2xl font-bold text-ink-900">Inkwell</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="font-sans text-sm text-ink-500 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={submit} className="card p-8 space-y-4">
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-ink-600 block mb-1.5">Username or Email</label>
            <input type="text" value={form.identifier} required
              onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
              className="input-field" placeholder="janedoe or you@example.com" />
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-ink-600 block mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} required
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center font-sans text-sm text-ink-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ink-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <BookOpen size={24} className="text-accent" />
            <span className="font-display text-2xl font-bold text-ink-900">Inkwell</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-900">Start writing</h1>
          <p className="font-sans text-sm text-ink-500 mt-1">Create your free account</p>
        </div>
        <form onSubmit={submit} className="card p-8 space-y-4">
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-ink-600 block mb-1.5">Full Name</label>
            <input type="text" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="input-field" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-ink-600 block mb-1.5">Username *</label>
            <input type="text" value={form.username} required
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="input-field" placeholder="janedoe" />
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-ink-600 block mb-1.5">Email *</label>
            <input type="email" value={form.email} required
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input-field" placeholder="jane@example.com" />
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-ink-600 block mb-1.5">Password *</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} required
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field pr-10" placeholder="Min. 6 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center font-sans text-sm text-ink-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
