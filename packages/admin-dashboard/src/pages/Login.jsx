import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useT, useLang } from '../lib/i18n'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const t = useT()
  const { lang, setLang } = useLang()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-neutral-800 border border-neutral-700 rounded-lg p-8">
        <div className="flex justify-end mb-2">
          <button type="button" onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
            className="text-xs text-neutral-400 hover:text-white border border-neutral-600 rounded px-2 py-1">
            {lang === 'en' ? '日本語' : 'EN'}
          </button>
        </div>
        <h1 className="text-xl font-semibold mb-1">Nexus Shift</h1>
        <p className="text-sm text-neutral-400 mb-6">{t('login.title')}</p>

        <label className="block text-xs text-neutral-400 mb-1">{t('login.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 rounded bg-neutral-900 border border-neutral-600 text-neutral-100 focus:outline-none focus:border-neutral-400"
          placeholder="admin@company.com"
        />

        <label className="block text-xs text-neutral-400 mb-1">{t('login.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 rounded bg-neutral-900 border border-neutral-600 text-neutral-100 focus:outline-none focus:border-neutral-400"
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 font-medium transition"
        >
          {loading ? t('login.signingin') : t('login.signin')}
        </button>
      </form>
    </div>
  )
}

export default Login
