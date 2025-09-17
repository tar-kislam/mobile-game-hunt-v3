import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface PublicProfileProps {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const { id } = await params

  // Find username by user id
  const user = await prisma.user.findUnique({
    where: { id },
    select: { username: true }
  })

  if (!user?.username) {
    redirect("/404")
  }

  redirect(`/${user.username}`)
}

