import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return {
    alternates: {
      canonical: `https://yourdomain.com/${username}`,
    },
  }
}

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  return children
}


