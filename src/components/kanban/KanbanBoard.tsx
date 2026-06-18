'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import type { Lead, Profile, Stage } from '@/types'
import { STAGES } from '@/types'
import KanbanColumn from './KanbanColumn'
import LeadCard from './LeadCard'
import AddLeadModal from '../lead/AddLeadModal'
import LeadDetailModal from '../lead/LeadDetailModal'
import { Plus, Search, X } from 'lucide-react'

interface KanbanBoardProps {
  initialLeads: Lead[]
  profile: Profile
  specialists?: { id: string; full_name: string }[]
}

export default function KanbanBoard({ initialLeads, profile, specialists = [] }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')
  const [filterSpecialist, setFilterSpecialist] = useState('')
  const [filterDevelopment, setFilterDevelopment] = useState('')
  const supabase = createClient()

  const developments = Array.from(new Set(leads.map(l => l.development).filter(Boolean))) as string[]

  const filteredLeads = leads.filter(l => {
    const matchSearch = !search || l.full_name.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase())
    const matchSpecialist = !filterSpecialist || l.specialist_id === filterSpecialist
    const matchDev = !filterDevelopment || l.development === filterDevelopment
    return matchSearch && matchSpecialist && matchDev
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeLead = leads.find(l => l.id === activeId)

  const leadsForStage = useCallback(
    (stage: Stage) => filteredLeads.filter(l => l.stage === stage),
    [filteredLeads]
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeLeadId = active.id as string
    const overId = over.id as string

    const activeLead = leads.find(l => l.id === activeLeadId)
    if (!activeLead) return

    // over is a column (stage id)
    const overStage = STAGES.find(s => s.id === overId)
    if (overStage && activeLead.stage !== overStage.id) {
      setLeads(prev =>
        prev.map(l => l.id === activeLeadId ? { ...l, stage: overStage.id } : l)
      )
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeLeadId = active.id as string
    const overId = over.id as string

    const activeLead = leads.find(l => l.id === activeLeadId)
    if (!activeLead) return

    // Determine target stage
    const overStage = STAGES.find(s => s.id === overId)
    const overLead = leads.find(l => l.id === overId)
    const targetStage: Stage = overStage?.id ?? overLead?.stage ?? activeLead.stage

    if (activeLead.stage !== targetStage) {
      // Update in Supabase
      await supabase
        .from('leads')
        .update({ stage: targetStage })
        .eq('id', activeLeadId)

      // Log activity
      await supabase.from('activities').insert({
        lead_id: activeLeadId,
        user_id: profile.id,
        type: 'stage_change',
        body: `Cambió de "${STAGES.find(s => s.id === activeLead.stage)?.label}" a "${STAGES.find(s => s.id === targetStage)?.label}"`,
      })
    } else if (overLead && activeLead.id !== overLead.id) {
      // Reorder within same column
      const stageLeads = leads.filter(l => l.stage === targetStage)
      const oldIndex = stageLeads.findIndex(l => l.id === activeLeadId)
      const newIndex = stageLeads.findIndex(l => l.id === overId)
      const reordered = arrayMove(stageLeads, oldIndex, newIndex)

      setLeads(prev => {
        const others = prev.filter(l => l.stage !== targetStage)
        return [...others, ...reordered]
      })

      // Persist positions
      await Promise.all(
        reordered.map((lead, i) =>
          supabase.from('leads').update({ position: i }).eq('id', lead.id)
        )
      )
    }
  }

  function handleLeadAdded(lead: Lead) {
    setLeads(prev => [...prev, lead])
    setShowAddModal(false)
  }

  function handleLeadUpdated(updated: Lead) {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    setSelectedLead(updated)
  }

  function handleLeadDeleted(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
    setSelectedLead(null)
  }

  const hasFilters = search || filterSpecialist || filterDevelopment

  return (
    <>
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {specialists.length > 0 && (
          <select
            value={filterSpecialist}
            onChange={e => setFilterSpecialist(e.target.value)}
            className="py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Todos los especialistas</option>
            {specialists.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        )}

        {developments.length > 0 && (
          <select
            value={filterDevelopment}
            onChange={e => setFilterDevelopment(e.target.value)}
            className="py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Todos los desarrollos</option>
            {developments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterSpecialist(''); setFilterDevelopment('') }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 transition-colors"
          >
            <X size={14} /> Limpiar
          </button>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-medium transition-all shadow-sm ml-auto hover:opacity-90"
          style={{ background: 'var(--brand)' }}
        >
          <Plus size={16} />
          Nuevo lead
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsForStage(stage.id)}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <LeadCard lead={activeLead} isDragging onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {showAddModal && (
        <AddLeadModal
          profile={profile}
          onClose={() => setShowAddModal(false)}
          onAdded={handleLeadAdded}
        />
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          profile={profile}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleLeadUpdated}
          onDeleted={handleLeadDeleted}
        />
      )}
    </>
  )
}
