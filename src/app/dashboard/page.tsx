import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import Navbar from '@/components/ui/Navbar'
import type { Lead, Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
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
    .select('*, specialist:profiles!specialist_id(id, full_name, avatar_url, role)')
    .order('position', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <Navbar profile={profile as Profile} />
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pipeline de leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {leads?.length ?? 0} leads activos
            </p>
          </div>
        </div>
        <KanbanBoard initialLeads={(leads as Lead[]) ?? []} profile={profile as Profile} />
      </main>
    </div>
  )
}
