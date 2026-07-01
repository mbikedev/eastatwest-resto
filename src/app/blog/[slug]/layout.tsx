import { Metadata } from 'next'
import { createClient } from '@/lib/supabaseServer'

type Props = {
  params: Promise<{ slug: string }>
}

async function getPostMetadata(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('title, excerpt, meta_title, meta_description, cover_image_url')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const canonical = `https://eastatwest.com/blog/${slug}`

  const post = await getPostMetadata(slug).catch(() => null)

  if (!post) {
    return {
      title: 'Blog Post Not Found | East At West',
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  const title = post.meta_title || `${post.title} | East At West`
  const description = post.meta_description || post.excerpt || undefined
  const image = post.cover_image_url || 'https://eastatwest.com/images/banner.webp'

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en': canonical,
        'fr': canonical,
        'nl': canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      locale: 'en_US',
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
