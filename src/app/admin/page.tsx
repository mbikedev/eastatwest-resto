'use client'

import Link from 'next/link'
import { useTheme } from '../../context/ThemeContext'
import { useAdminAuth } from '../../hooks/useAdminAuth'

const ADMIN_SECTIONS = [
  {
    href: '/admin/reservations',
    title: 'Reservations',
    description: 'View, confirm, and manage table reservations',
    icon: '📅',
  },
  {
    href: '/admin/orders',
    title: 'Takeaway Orders',
    description: 'Track and manage takeaway orders',
    icon: '🥡',
  },
  {
    href: '/admin/comments',
    title: 'Blog Comments',
    description: 'Moderate and reply to blog post comments',
    icon: '💬',
  },
  {
    href: '/admin/holidays',
    title: 'Holidays & Closures',
    description: 'Manage restaurant closures and holiday dates',
    icon: '🗓️',
  },
]

export default function AdminDashboard() {
  const { loading, isAuthenticated } = useAdminAuth()
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const bg = isDark ? 'bg-[#1A1A1A]' : 'bg-[#F5F0E6]'
  const cardBg = isDark ? 'bg-[#242424]' : 'bg-white'
  const text = isDark ? 'text-white' : 'text-[#1A1A1A]'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'

  if (loading || !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="w-10 h-10 border-4 border-[#A8D5BA] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${bg}`}>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <p className="text-[#A8D5BA] font-semibold tracking-widest uppercase text-sm mb-2">
            East @ West
          </p>
          <h1 className={`text-4xl font-bold ${text}`}>Admin Dashboard</h1>
          <p className={`mt-2 ${muted}`}>Manage your restaurant operations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ADMIN_SECTIONS.map(section => (
            <Link key={section.href} href={section.href} className="group block">
              <div className={`rounded-2xl border ${border} ${cardBg} p-8 h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 group-hover:border-[#A8D5BA]`}>
                <div className="text-4xl mb-4">{section.icon}</div>
                <h2 className={`text-xl font-bold mb-2 group-hover:text-[#A8D5BA] transition-colors ${text}`}>
                  {section.title}
                </h2>
                <p className={`text-sm ${muted}`}>{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
