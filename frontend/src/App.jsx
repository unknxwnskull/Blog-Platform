import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import WritePage from './pages/WritePage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import { BookmarksPage, CategoriesPage } from './pages/OtherPages'
import DraftsPage from './pages/DraftsPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/write" element={<WritePage />} />
            <Route path="/edit/:id" element={<WritePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="*" element={
              <div className="text-center py-32">
                <h1 className="font-display text-6xl font-bold text-ink-200">404</h1>
                <p className="font-sans text-ink-500 mt-3 text-lg">Page not found</p>
                <a href="/" className="btn-primary inline-block mt-6">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: 0,
              border: '1px solid #d9d0be',
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}
