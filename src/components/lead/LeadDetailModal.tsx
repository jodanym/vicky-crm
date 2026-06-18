'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, Profile, Activity, Stage } from '@/types'
import { STAGES } from '@/types'
import { X, Phone, Mail, DollarSign, Building2, Pencil, Trash2, Plus, PhoneCall, StickyNote, ArrowRight } from 'lucide-react'

interface Props {
  lead: Lead
  profile: Profile
  onClose: () => void
  onUpdated: (lead: Lead) => void
  onDeleted: (id: string) => void
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call:         <PhoneCall size={12} />,
  email:        <Mail size={12} />,
  note:         <StickyNote size={12} />,
  stage_change: <ArrowRight size={12} />,
  reminder:     <StickyNote size={12} />,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatBudget(n: number | null) {
  if (!n) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

export default function LeadDetailModal({ lead, profile, onClose, onUpdated, onDeleted }: Props) {
  const supabase = createClient()
  const [activities, setActivities] = useState<Activity[]>([])
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  const [form, setForm] = useState({
    full_name: lead.full_name,
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    budget: lead.budget?.toString() ?? '',
    development: lead.development ?? '',
    stage: lead.stage,
    notes: lead.notes ?? '',
  })

  useEffect(() => {
    loadActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id])

  async function loadActivities() {
    const { data } = await supabase
      .from('activities')
      .select('*, user:profiles!user_id(id, full_name)')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })

    if (data) setActivities(data as Activity[])
  }

  async function handleSave() {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .update({
        full_name: form.full_name,
        email: form.email || null,
        phone: form.phone || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        development: form.development || null,
        stage: form.stage as Stage,
        notes: form.notes || null,
      })
      .eq('id', lead.id)
      .select('*, specialist:profiles!specialist_id(id, full_name, avatar_url, role)')
      .single()

    if (!error && data) {
      if (form.stage !== lead.stage) {
        await supabase.from('activities').insert({
          lead_id: lead.id,
          user_id: profile.id,
          type: 'stage_change',
          body: `Cambió de "${STAGES.find(s => s.id === lead.stage)?.label}" a "${STAGES.find(s => s.id === form.stage)?.label}"`,
        })
        await loadActivities()
      }
      onUpdated(data as Lead)
      setEditMode(false)
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este lead? Esta acción no se puede deshacer.')) return
    await supabase.from('leads').delete().eq('id', lead.id)
    onDeleted(lead.id)
  }

  async function handleAddNote() {
    if (!newNote.trim()) return
    setAddingNote(true)
    await supabase.from('activities').insert({
      lead_id: lead.id,
      user_id: profile.id,
      type: 'note',
      body: newNote.trim(),
    })
    setNewNote('')
    await loadActivities()
    setAddingNote(false)
  }

  const stageInfo = STAGES.find(s => s.id === (editMode ? form.stage : lead.stage))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <span className="text-violet-700 dark:text-violet-300 font-bold text-sm">
                {lead.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>
            <div>
              {editMode ? (
                <input
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="text-lg font-bold bg-transparent border-b border-violet-400 focus:outline-none text-gray-900 dark:text-white"
                />
              ) : (
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{lead.full_name}</h2>
              )}
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-white ${stageInfo?.color}`}>
                {stageInfo?.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {profile.role !== 'specialist' || lead.specialist_id === profile.id ? (
              <>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-violet-600 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : null}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <InfoItem icon={<Mail size={14} />} label="Correo">
                {editMode
                  ? <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="email@ejemplo.com" />
                  : <span className="text-sm text-gray-700 dark:text-gray-300">{lead.email ?? '—'}</span>
                }
              </InfoItem>
              <InfoItem icon={<Phone size={14} />} label="Teléfono">
                {editMode
                  ? <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+52 55…" />
                  : <span className="text-sm text-gray-700 dark:text-gray-300">{lead.phone ?? '—'}</span>
                }
              </InfoItem>
              <InfoItem icon={<DollarSign size={14} />} label="Presupuesto">
                {editMode
                  ? <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} className={inputClass} placeholder="2000000" />
                  : <span className="text-sm text-gray-700 dark:text-gray-300">{formatBudget(lead.budget)}</span>
                }
              </InfoItem>
              <InfoItem icon={<Building2 size={14} />} label="Desarrollo">
                {editMode
                  ? <input value={form.development} onChange={e => setForm(p => ({ ...p, development: e.target.value }))} className={inputClass} placeholder="Hama" />
                  : <span className="text-sm text-gray-700 dark:text-gray-300">{lead.development ?? '—'}</span>
                }
              </InfoItem>
            </div>

            {/* Stage selector (edit mode) */}
            {editMode && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Etapa</label>
                <select
                  value={form.stage}
                  onChange={e => setForm(p => ({ ...p, stage: e.target.value as Stage }))}
                  className={inputClass}
                >
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notas</label>
              {editMode
                ? <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${inputClass} resize-none h-20`} />
                : <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.notes || '—'}</p>
              }
            </div>

            {/* Save / Cancel in edit mode */}
            {editMode && (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="flex-1 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={loading} className="flex-1 py-2 text-white rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--brand)' }}>
                  {loading ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Actividad</h3>

              {/* Add note */}
              <div className="flex gap-2 mb-4">
                <input
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  className={inputClass}
                  placeholder="Agregar nota o registro…"
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="px-3 py-2 text-white rounded-lg text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--brand)' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Activities list */}
              <div className="space-y-2">
                {activities.map(act => (
                  <div key={act.id} className="flex gap-2.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mt-0.5">
                      {ACTIVITY_ICONS[act.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{act.body}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {act.user?.full_name} · {formatDate(act.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Sin actividad registrada</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}
