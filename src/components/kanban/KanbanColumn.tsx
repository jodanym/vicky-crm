'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Lead, Stage } from '@/types'
import LeadCardSortable from './LeadCardSortable'

interface KanbanColumnProps {
  stage: { id: Stage; label: string; color: string }
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

export default function KanbanColumn({ stage, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-zinc-900 rounded-xl overflow-hidden">
      {/* Column header */}
      <div className="px-3 py-2.5 flex items-center gap-2 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{stage.label}</span>
        <span className="ml-auto text-xs bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-violet-50 dark:bg-violet-900/10' : ''
        }`}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCardSortable key={lead.id} lead={lead} onClick={onLeadClick} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 dark:text-gray-600">
            Sin leads
          </div>
        )}
      </div>
    </div>
  )
}
