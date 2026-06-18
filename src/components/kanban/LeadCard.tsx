'use client'

import type { Lead } from '@/types'
import { DollarSign, Building2, Phone } from 'lucide-react'

interface Props {
  lead: Lead
  isDragging?: boolean
  onClick: (lead: Lead) => void
}

function formatBudget(n: number | null) {
  if (!n) return null
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function LeadCard({ lead, isDragging = false, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(lead)}
      className={`
        bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-zinc-700
        cursor-pointer hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600 transition-all
        ${isDragging ? 'shadow-xl rotate-1 scale-105' : ''}
      `}
    >
      {/* Name + avatar */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
          <span className="text-violet-700 dark:text-violet-300 text-xs font-semibold">
            {initials(lead.full_name)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{lead.full_name}</p>
          {lead.email && (
            <p className="text-xs text-gray-400 truncate">{lead.email}</p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5">
        {lead.budget && (
          <span className="flex items-center gap-0.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-md">
            <DollarSign size={10} />
            {formatBudget(lead.budget)}
          </span>
        )}
        {lead.development && (
          <span className="flex items-center gap-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-md">
            <Building2 size={10} />
            {lead.development}
          </span>
        )}
        {lead.phone && (
          <span className="flex items-center gap-0.5 text-xs bg-gray-50 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
            <Phone size={10} />
            {lead.phone}
          </span>
        )}
      </div>

      {/* Specialist */}
      {lead.specialist && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-700 flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-600 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-300 text-[9px] font-medium">
              {initials(lead.specialist.full_name)}
            </span>
          </div>
          <span className="text-xs text-gray-400">{lead.specialist.full_name}</span>
        </div>
      )}
    </div>
  )
}
