import { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const canonical = `https://eastatwest.com/blog/${slug}`

  return {
    alternates: {
      canonical,
      languages: {
        'en': canonical,
        'fr': canonical,
        'nl': canonical,
        'x-default': canonical,
      },
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
