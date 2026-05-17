'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../../context/ThemeContext'

const NAV_ITEMS = [
  { href: '/admin/reservations', label: 'Reservations', icon: '📅' },
  { href: '/admin/orders', label: 'Takeaway Orders', icon: '🥡' },
  { href: '/admin/comments', label: 'Blog Comments', icon: '💬' },
  { href: '/admin/holidays', label: 'Holidays & Closures', icon: '🗓️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const navBg = isDark ? 'bg-[#242424] border-gray-700' : 'bg-white border-gray-200'
  const text = isDark ? 'text-white' : 'text-[#1A1A1A]'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'

  const isSubPage = NAV_ITEMS.some(item => pathname === item.href)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#F5F0E6]'}`}>
      {/* Top nav bar — only shown on sub-pages, not on /admin itself */}
      {isSubPage && (
        <nav className={`border-b ${navBg} sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              <Link
                href="/admin"
                className={`flex-shrink-0 px-3 py-4 text-sm font-semibold text-[#A8D5BA] hover:text-[#A8D5BA]/80 transition-colors`}
              >
                ← Dashboard
              </Link>
              <span className={`${muted} px-1`}>|</span>
              {NAV_ITEMS.map(item => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      active
                        ? 'border-[#A8D5BA] text-[#A8D5BA]'
                        : `border-transparent ${muted} hover:${text} hover:border-gray-300`
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      )}

      {children}
    </div>
  )
}
