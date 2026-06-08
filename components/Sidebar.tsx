'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col border-r border-[#e2e8f0]"
      style={{ width: '280px', backgroundColor: '#eff4ff' }}
    >
      <div className="p-6 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: '#3525cd' }}
          >
            FP
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">FormaPro</p>
            <p className="text-xs text-gray-500">Academy</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
          Menu
        </p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
              style={isActive ? { backgroundColor: '#3525cd' } : {}}
            >
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#e2e8f0]">
        <p className="text-xs text-gray-400 text-center">FormaPro Academy © 2026</p>
      </div>
    </aside>
  )
}
