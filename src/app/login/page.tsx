'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--brand-faint)' }}>
      {/* Panel izquierdo — marca */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{ background: 'var(--brand)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Vicky CRM</span>
        </div>

        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Bienes raíces · IA</p>
          <h1 className="text-white text-3xl font-semibold leading-snug mb-4">
            El CRM que trabaja<br />contigo, no contra ti.
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Gestiona tu pipeline de leads con inteligencia artificial.
            Desde el primer contacto hasta el cierre.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { icon: '⚡', text: 'Kanban visual con drag & drop' },
              { icon: '🤖', text: 'IA integrada vía WhatsApp' },
              { icon: '📊', text: 'Analytics en tiempo real' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-sm">{f.icon}</span>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">© 2026 Vicky CRM</p>
      </div>

      {/* Panel derecho — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">Vicky CRM</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Bienvenido</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Ingresa tus credenciales para continuar</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand)' } as React.CSSProperties}
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-white font-medium rounded-lg text-sm transition-all disabled:opacity-60"
              style={{ background: loading ? 'var(--brand-dark)' : 'var(--brand)' }}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
