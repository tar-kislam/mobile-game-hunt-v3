import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const revalidate = 300

async function getSoftLaunchCountries(): Promise<{ country: string; count: number }[]> {
  const products = await prisma.product.findMany({
    where: {
      countries: { isEmpty: false },
      status: 'PUBLISHED'
    },
    select: { countries: true }
  })

  const counter: Record<string, number> = {}
  for (const p of products) {
    for (const c of p.countries) {
      if (!c) continue
      counter[c] = (counter[c] || 0) + 1
    }
  }

  return Object.entries(counter)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => a.country.localeCompare(b.country))
}

export default async function SoftLaunchPage() {
  const countries = await getSoftLaunchCountries()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Soft-Launch Radar</h1>
          <p className="text-muted-foreground mt-2">Explore soft-launched games by country</p>
        </div>

        {countries.length === 0 ? (
          <Card className="rounded-2xl shadow-lg border-white/10">
            <CardContent className="p-8 text-center text-muted-foreground">
              No soft-launch entries found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {countries.map(({ country, count }) => (
              <Link key={country} href={`/soft-launch/${encodeURIComponent(country)}`}>
                <Card className="rounded-2xl shadow-lg border-white/10 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium truncate">{country}</span>
                    <Badge variant="secondary" className="shrink-0">{count}</Badge>
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


