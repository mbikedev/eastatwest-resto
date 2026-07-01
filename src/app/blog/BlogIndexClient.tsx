'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { getBlogPosts, getBlogTags, formatBlogDate } from '@/lib/blog'
import type { Blog } from '@/types/blog'

export default function BlogIndexClient() {
  const { t, i18n } = useTranslation('common')
  const { theme } = useTheme()

  const [posts, setPosts] = useState<Blog[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const lang = i18n.language || 'en'
        const [fetchedPosts, fetchedTags] = await Promise.all([
          getBlogPosts({}, lang),
          getBlogTags(lang),
        ])
        setPosts(fetchedPosts)
        setTags(fetchedTags)
      } catch {
        setError('Failed to load blog posts.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [i18n.language])

  const filtered = posts.filter(post => {
    const matchesTag = selectedTag === 'all' || post.tags?.includes(selectedTag)
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(search.toLowerCase())
    return matchesTag && matchesSearch
  })

  const isDark = theme === 'dark'
  const bg = isDark ? 'bg-[#1A1A1A]' : 'bg-[#F5F0E6]'
  const cardBg = isDark ? 'bg-[#242424]' : 'bg-white'
  const text = isDark ? 'text-white' : 'text-[#1A1A1A]'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className={`min-h-screen transition-colors duration-500 ${bg}`}>
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[#A8D5BA]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#A8D5BA] font-semibold tracking-widest uppercase text-sm mb-4">
            East @ West
          </p>
          <h1 className={`text-4xl sm:text-5xl font-bold mb-6 ${text}`}>
            {t('blog.title')}
          </h1>
          <p className={`text-lg leading-relaxed ${muted}`}>
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${muted}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('blog.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${border} ${cardBg} ${text} focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] transition-colors`}
            />
          </div>

          {/* Tag filter */}
          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTag === 'all'
                    ? 'bg-[#A8D5BA] text-white'
                    : `${cardBg} ${text} border ${border} hover:border-[#A8D5BA]`
                }`}
              >
                {t('blog.filterAll')}
              </button>
              {tags.slice(0, 6).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-[#A8D5BA] text-white'
                      : `${cardBg} ${text} border ${border} hover:border-[#A8D5BA]`
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-[#A8D5BA] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className={`text-xl font-semibold mb-2 ${text}`}>{t('blog.noPostsFound')}</p>
            <p className={muted}>{t('blog.noPostsFoundDesc')}</p>
          </div>
        )}

        {/* Posts grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <article className={`rounded-2xl overflow-hidden border ${border} ${cardBg} h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1`}>
                  {/* Cover image */}
                  <div className="relative h-52 bg-gray-200 overflow-hidden">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#A8D5BA]/20">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                    {post.featured && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-[#A8D5BA] text-white text-xs font-semibold rounded-full">
                        {t('blog.featured')}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className={`text-lg font-bold mb-3 leading-snug group-hover:text-[#A8D5BA] transition-colors ${text}`}>
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className={`text-sm leading-relaxed mb-4 flex-1 line-clamp-3 ${muted}`}>
                        {post.excerpt}
                      </p>
                    )}

                    {/* Footer */}
                    <div className={`flex items-center justify-between text-xs pt-4 border-t ${border} ${muted} mt-auto`}>
                      <span>{post.published_at ? formatBlogDate(post.published_at) : ''}</span>
                      {post.reading_time && (
                        <span>{post.reading_time} {t('blog.minRead')}</span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
