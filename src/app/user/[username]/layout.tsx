import type { Metadata } from 'next'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return {
    alternates: {
      canonical: `https://yourdomain.com/${username}`,
    },
  }
}

export default async function UsernameLayout({ children }: LayoutProps) {
  return children as React.ReactNode
}


