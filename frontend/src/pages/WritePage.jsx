import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, Save, Send, X } from 'lucide-react'
import { postsAPI, categoriesAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function WritePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', cover_image: '',
    category_id: '', status: 'draft', tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => { if (!user) navigate('/login') }, [user])

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.categories)).catch(() => {})
    if (editId) {
      Promise.all([
        postsAPI.getAll({ limit: 100, status: 'published' }),
        postsAPI.getAll({ limit: 100, status: 'draft' }),
      ])
        .then(([publishedRes, draftRes]) => {
          const posts = [...publishedRes.data.posts, ...draftRes.data.posts]
          const p = posts.find(x => x.id === Number(editId))
          if (p) return postsAPI.getBySlug(p.slug)
        })
        .then(r => {
          if (r) {
            const p = r.data.post
            setForm({
              title: p.title, content: p.content, excerpt: p.excerpt || '',
              cover_image: p.cover_image || '', category_id: p.category_id || '',
              status: p.status, tags: p.tags?.map(t => t.name) || [],
            })
          }
        }).catch(() => {})
    }
  }, [editId])

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().replace(/,/g, '')
      if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
        setForm(f => ({ ...f, tags: [...f.tags, tag] }))
      }
      setTagInput('')
    }
  }

  const submit = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.content.trim()) { toast.error('Content is required'); return }
    setSaving(true)
    try {
      const payload = { ...form, status }
      let r
      if (editId) {
        r = await postsAPI.update(editId, payload)
        toast.success('Post updated!')
      } else {
        r = await postsAPI.create(payload)
        toast.success(status === 'published' ? 'Post published!' : 'Draft saved!')
      }
      navigate(status === 'published' ? `/post/${r.data.post.slug}` : '/drafts')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{editId ? 'Edit Article' : 'New Article'}</h1>
          <p className="font-sans text-sm text-ink-500 mt-1">Write something worth reading</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
  <button onClick={() => setPreview(!preview)} className="btn-ghost flex items-center gap-1.5 text-sm">
            <Eye size={15} /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={() => submit('draft')} disabled={saving}
            className="btn-outline flex items-center gap-1.5 text-xs disabled:opacity-50">
            <Save size={13} /> Save Draft
          </button>
          <button onClick={() => submit('published')} disabled={saving}
            className="btn-primary flex items-center gap-1.5 text-xs disabled:opacity-50">
            <Send size={13} /> {editId ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="card p-8">
          {form.cover_image && <img src={form.cover_image} alt="" className="w-full h-64 object-cover mb-6" />}
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-4">{form.title || 'Untitled'}</h1>
          {form.excerpt && <p className="font-body text-ink-500 italic mb-6">{form.excerpt}</p>}
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: form.content }} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="card p-4">
            <label className="font-sans text-xs uppercase tracking-wider text-ink-500 mb-2 block">Cover Image URL</label>
            <input type="url" value={form.cover_image} placeholder="https://..."
              onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} className="input-field" />
            {form.cover_image && <img src={form.cover_image} alt="" className="mt-3 w-full h-40 object-cover" />}
          </div>

          <textarea value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Your article title..." rows={2}
            className="w-full font-display text-3xl font-bold text-ink-900 placeholder:text-ink-300
                       bg-transparent border-0 border-b-2 border-ink-200 focus:border-accent
                       focus:outline-none resize-none py-3 transition-colors" />

          <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            placeholder="Brief summary..." rows={2} className="input-field resize-none font-body italic" />

          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-ink-500 mb-2 block">Content (HTML supported)</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="<p>Start writing...</p>" rows={20} className="input-field resize-y font-mono text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-ink-500 mb-2 block">Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="input-field bg-white">
                <option value="">— Select category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-ink-500 mb-2 block">Tags (Enter to add)</label>
              <div className="input-field flex flex-wrap gap-1.5 min-h-[46px]">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 bg-ink-900 text-ink-50 text-xs px-2 py-0.5 font-sans">
                    {t}
                    <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} className="hover:text-accent ml-1">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                  placeholder={form.tags.length < 8 ? 'Add tag...' : ''}
                  className="border-0 outline-none bg-transparent text-sm font-sans flex-1 min-w-20" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
            <button onClick={() => navigate(-1)} className="btn-ghost text-sm">Cancel</button>
            <button onClick={() => submit('draft')} disabled={saving} className="btn-outline flex items-center gap-1.5 text-xs">
              <Save size={13} /> Save Draft
            </button>
            <button onClick={() => submit('published')} disabled={saving} className="btn-primary flex items-center gap-1.5 text-xs">
              <Send size={13} /> {editId ? 'Update Post' : 'Publish Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
