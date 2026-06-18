'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import type { Profile } from '@/types'
import { LogOut, LayoutDashboard, BarChart3 } from 'lucide-react'

interface NavbarProps {
  profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const navLinks = [
    { href: '/dashboard',           label: 'Pipeline',  icon: <LayoutDashboard size={15} /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 size={15} /> },
  ]

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-4 md:px-6 py-0 flex items-center justify-between h-14">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--brand)' }}
        >
          <span className="text-white text-sm font-bold">V</span>
        </div>
        <span className="font-semibold text-gray-900 dark:text-white tracking-tight">Vicky</span>
        <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 font-normal">CRM</span>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex items-center h-full">
        {navLinks.map(link => {
          const active = pathname === link.href
          return (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors relative h-14"
              style={active ? { color: 'var(--brand)' } : { color: '#6B7280' }}
            >
              {link.icon}
              {link.label}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: 'var(--brand)' }}
                />
              )}
            </a>
          )
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--brand-light)' }}
          >
            <span className="text-xs font-semibold" style={{ color: 'var(--brand-text)' }}>{initials}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-none">{profile?.full_name}</p>
            <p className="text-[10px] text-gray-400 capitalize mt-0.5">{profile?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ml-1"
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
