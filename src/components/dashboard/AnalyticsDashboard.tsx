'use client'

import type { Lead, Profile } from '@/types'
import { STAGES } from '@/types'
import { DollarSign, Users, TrendingUp, Award, BarChart3 } from 'lucide-react'

interface Props {
  leads: Lead[]
  specialists: { id: string; full_name: string; role: string }[]
  profile: Profile
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function pct(a: number, b: number) {
  if (b === 0) return '0%'
  return `${Math.round((a / b) * 100)}%`
}

const STAGE_COLORS = {
  primer_contacto: { dot: 'bg-blue-500',   bar: 'bg-blue-500',   funnel: 'bg-blue-400'   },
  enganche:        { dot: 'bg-amber-500',  bar: 'bg-amber-500',  funnel: 'bg-amber-400'  },
  firma_contrato:  { dot: 'bg-purple-500', bar: 'bg-purple-500', funnel: 'bg-purple-400' },
  cierre:          { dot: 'bg-green-500',  bar: 'bg-green-500',  funnel: 'bg-green-400'  },
} as Record<string, { dot: string; bar: string; funnel: string }>

export default function AnalyticsDashboard({ leads, specialists }: Props) {
  const totalLeads = leads.length
  const totalRevenue = leads.reduce((s, l) => s + (l.budget ?? 0), 0)
  const closedLeads = leads.filter(l => l.stage === 'cierre')
  const closedRevenue = closedLeads.reduce((s, l) => s + (l.budget ?? 0), 0)
  const conversionRate = pct(closedLeads.length, totalLeads)

  const revenueByStage = STAGES.map(s => ({
    ...s,
    count: leads.filter(l => l.stage === s.id).length,
    revenue: leads.filter(l => l.stage === s.id).reduce((sum, l) => sum + (l.budget ?? 0), 0),
  }))

  const maxRevenue = Math.max(...revenueByStage.map(s => s.revenue), 1)

  const bySpecialist = specialists.map(sp => {
    const spLeads = leads.filter(l => l.specialist_id === sp.id)
    const closed = spLeads.filter(l => l.stage === 'cierre')
    return {
      ...sp,
      total: spLeads.length,
      closed: closed.length,
      revenue: spLeads.reduce((s, l) => s + (l.budget ?? 0), 0),
      closedRevenue: closed.reduce((s, l) => s + (l.budget ?? 0), 0),
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const maxSpRevenue = Math.max(...bySpecialist.map(s => s.revenue), 1)

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={<Users size={18} />}       label="Total leads"    value={totalLeads.toString()}          color="blue" />
        <KpiCard icon={<DollarSign size={18} />}  label="Pipeline total" value={fmt(totalRevenue)}              color="violet" />
        <KpiCard icon={<Award size={18} />}       label="Cierres"        value={`${closedLeads.length} leads`}  color="green"  sub={fmt(closedRevenue)} />
        <KpiCard icon={<TrendingUp size={18} />}  label="Conversión"     value={conversionRate}                 color="amber"  sub="leads → cierre" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue por etapa */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-gray-400 dark:text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Revenue por etapa</h2>
          </div>
          <div className="space-y-3">
            {revenueByStage.map(s => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${STAGE_COLORS[s.id].dot}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-600">({s.count})</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{fmt(s.revenue)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STAGE_COLORS[s.id].bar}`}
                    style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Funnel */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-xs text-gray-400 dark:text-gray-600 mb-2">Distribución de leads por etapa</p>
            <div className="flex items-end gap-1 h-16">
              {revenueByStage.map(s => {
                const rate = totalLeads > 0 ? (s.count / totalLeads) * 100 : 0
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 dark:text-gray-600">{Math.round(rate)}%</span>
                    <div
                      className={`w-full rounded-t opacity-80 ${STAGE_COLORS[s.id].funnel}`}
                      style={{ height: `${Math.max(rate, 4)}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-1 mt-1">
              {revenueByStage.map(s => (
                <div key={s.id} className="flex-1 text-center">
                  <span className="text-[10px] text-gray-400 dark:text-gray-600 truncate block">{s.label.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Por especialista */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users size={16} className="text-gray-400 dark:text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Especialistas</h2>
          </div>
          {bySpecialist.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-8">Sin especialistas</p>
          ) : (
            <div className="space-y-4">
              {bySpecialist.map(sp => {
                const initials = sp.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                return (
                  <div key={sp.id}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--brand-light)' }}
                      >
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--brand-text)' }}>{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{sp.full_name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 ml-2 flex-shrink-0">{sp.total} leads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-10">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(sp.revenue / maxSpRevenue) * 100}%`,
                            background: 'var(--brand)',
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 w-14 text-right flex-shrink-0">{fmt(sp.revenue)}</span>
                    </div>
                    <div className="ml-10 flex gap-3 mt-0.5">
                      <span className="text-[10px] text-green-600 dark:text-green-500">{sp.closed} cierres · {fmt(sp.closedRevenue)}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-600">{pct(sp.closed, sp.total)} conv.</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color: 'blue' | 'violet' | 'green' | 'amber'
}) {
  const colors = {
    blue:   'bg-blue-50   dark:bg-blue-950   text-blue-600   dark:text-blue-400',
    violet: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
    green:  'bg-green-50  dark:bg-green-950  text-green-600  dark:text-green-400',
    amber:  'bg-amber-50  dark:bg-amber-950  text-amber-600  dark:text-amber-400',
  }
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}
