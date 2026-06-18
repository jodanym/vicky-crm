import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'
import type { Profile, Lead } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: leads } = await supabase
    .from('leads')
    .select('*, specialist:profiles!specialist_id(id, full_name)')

  const { data: specialists } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'specialist')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <Navbar profile={profile as Profile} />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">KPIs y métricas del pipeline</p>
        </div>
        <AnalyticsDashboard
          leads={(leads as Lead[]) ?? []}
          specialists={specialists ?? []}
          profile={profile as Profile}
        />
      </main>
    </div>
  )
}
