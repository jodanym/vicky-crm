'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, Profile, Stage } from '@/types'
import { STAGES } from '@/types'
import { X } from 'lucide-react'

interface Props {
  profile: Profile
  onClose: () => void
  onAdded: (lead: Lead) => void
}

export default function AddLeadModal({ profile, onClose, onAdded }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    budget: '',
    development: '',
    stage: 'primer_contacto' as Stage,
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('leads')
      .insert({
        full_name: form.full_name,
        email: form.email || null,
        phone: form.phone || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        development: form.development || null,
        stage: form.stage,
        notes: form.notes || null,
        specialist_id: profile.id,
        position: 9999,
      })
      .select('*, specialist:profiles!specialist_id(id, full_name, avatar_url, role)')
      .single()

    if (!error && data) {
      // Log activity
      await supabase.from('activities').insert({
        lead_id: data.id,
        user_id: profile.id,
        type: 'note',
        body: 'Lead creado',
      })
      onAdded(data as Lead)
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nuevo lead</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Nombre completo *">
            <input
              required
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              className={inputClass}
              placeholder="Jose Lopez"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Correo">
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={inputClass}
                placeholder="jose@gmail.com"
              />
            </Field>
            <Field label="Teléfono">
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={inputClass}
                placeholder="+52 55 0000 0000"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Presupuesto (USD)">
              <input
                type="number"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
                className={inputClass}
                placeholder="2000000"
              />
            </Field>
            <Field label="Desarrollo">
              <input
                value={form.development}
                onChange={e => set('development', e.target.value)}
                className={inputClass}
                placeholder="Hama"
              />
            </Field>
          </div>

          <Field label="Etapa inicial">
            <select
              value={form.stage}
              onChange={e => set('stage', e.target.value)}
              className={inputClass}
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Notas">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className={`${inputClass} resize-none h-20`}
              placeholder="Observaciones iniciales…"
            />
          </Field>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 text-white rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--brand)' }}
            >
              {loading ? 'Guardando…' : 'Crear lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}
