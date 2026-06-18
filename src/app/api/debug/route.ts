import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: leads, error } = await supabase.from('leads').select('id, full_name, stage')

  return NextResponse.json({
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    leads_count: leads?.length ?? 0,
    leads_error: error?.message ?? null,
    leads,
  })
}
