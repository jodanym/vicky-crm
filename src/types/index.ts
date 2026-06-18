export type Role = 'specialist' | 'manager' | 'admin'

export type Stage = 'primer_contacto' | 'enganche' | 'firma_contrato' | 'cierre'

export type ActivityType = 'call' | 'email' | 'note' | 'stage_change' | 'reminder'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  role: Role
  created_at: string
}

export interface Lead {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  budget: number | null
  development: string | null
  stage: Stage
  specialist_id: string | null
  position: number
  notes: string | null
  created_at: string
  updated_at: string
  specialist?: Profile
}

export interface Activity {
  id: string
  lead_id: string
  user_id: string | null
  type: ActivityType
  body: string
  duration_s: number | null
  created_at: string
  user?: Profile
}

export const STAGES: { id: Stage; label: string; labelEn: string; color: string }[] = [
  { id: 'primer_contacto', label: 'Primer contacto', labelEn: 'First contact', color: 'bg-blue-500' },
  { id: 'enganche',        label: 'Enganche',         labelEn: 'Down payment',  color: 'bg-amber-500' },
  { id: 'firma_contrato',  label: 'Firma de contrato',labelEn: 'Contract sign', color: 'bg-purple-500' },
  { id: 'cierre',          label: 'Cierre',           labelEn: 'Closed',        color: 'bg-green-500' },
]
