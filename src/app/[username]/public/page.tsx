import { redirect } from 'next/navigation'

interface UsernameProfileProps {
  params: Promise<{ username: string }>
}

export default async function UsernameProfilePage({ params }: UsernameProfileProps) {
  const { username } = await params
  redirect(`/${username}`)
}
