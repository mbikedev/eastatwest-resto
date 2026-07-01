import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | East At West Lebanese Restaurant Brussels',
  description: 'Explore our Lebanese food blog: authentic recipes, cooking tips, and the culinary traditions behind East At West\'s Mediterranean cuisine in Brussels.',
  alternates: {
    canonical: 'https://eastatwest.com/blog',
    languages: {
      'en': 'https://eastatwest.com/blog',
      'fr': 'https://eastatwest.com/blog',
      'nl': 'https://eastatwest.com/blog',
      'x-default': 'https://eastatwest.com/blog',
    },
  },
  openGraph: {
    title: 'Blog | East At West Lebanese Restaurant Brussels',
    description: 'Explore our Lebanese food blog: authentic recipes, cooking tips, and the culinary traditions behind East At West\'s Mediterranean cuisine in Brussels.',
    url: 'https://eastatwest.com/blog',
    type: 'website',
    locale: 'en_US',
    images: [{
      url: 'https://eastatwest.com/images/banner.webp',
      width: 1200,
      height: 630,
      alt: 'East At West Lebanese Restaurant Blog'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | East At West Lebanese Restaurant Brussels',
    description: 'Authentic Lebanese recipes, cooking tips & culinary traditions from East At West Brussels.',
    images: ['https://eastatwest.com/images/banner.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogListingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
