export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ country: string }>
}


export default async function CountrySoftLaunchPage({ params }: PageProps) {
  const { country } = await params
  if (!country) return notFound()

  const products = await prisma.product.findMany({
    where: {
      countries: { has: country },
      status: 'PUBLISHED'
    },
    include: {
      _count: { select: { votes: true, comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Soft-Launch in {country}</h1>
            <p className="text-muted-foreground mt-1">{products.length} games</p>
          </div>
          <Link href="/soft-launch" className="text-sm text-muted-foreground hover:underline">All Countries</Link>
        </div>

        {products.length === 0 ? (
          <Card className="rounded-2xl shadow-lg border-white/10">
            <CardContent className="p-8 text-center text-muted-foreground">
              No games in this country yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <Link key={p.id} href={`/product/${p.slug || p.id}`}>
                <Card className="rounded-2xl shadow-lg border-white/10 hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="truncate text-lg">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.platforms?.map((plat) => (
                        <Badge key={plat} variant="outline" className="text-xs">{plat.toUpperCase()}</Badge>
                      ))}
                      <Badge variant="secondary" className="text-xs">{p._count.votes} votes</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


