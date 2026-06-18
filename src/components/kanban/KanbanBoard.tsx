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
import { Plus } from 'lucide-react'

interface KanbanBoardProps {
  initialLeads: Lead[]
  profile: Profile
}

export default function KanbanBoard({ initialLeads, profile }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeLead = leads.find(l => l.id === activeId)

  const leadsForStage = useCallback(
    (stage: Stage) => leads.filter(l => l.stage === stage),
    [leads]
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

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
