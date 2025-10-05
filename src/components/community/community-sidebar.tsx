"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, User, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { cn } from '@/lib/utils'

interface CommunityStats {
  activeMembers: number
  postsToday: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CommunitySidebar() {
  const pathname = usePathname()
  const { data: stats, error } = useSWR<CommunityStats>(
    '/api/community/stats',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const isActive = (path: string) => pathname === path

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const sidebarItems = [
    {
      icon: Home,
      label: 'Home Feed',
      href: '/community',
      description: 'Latest community posts'
    },
    {
      icon: User,
      label: 'My Posts',
      href: '/community/my-posts',
      description: 'Your posts and activity'
    },
    {
      icon: Trophy,
      label: 'Top Hunters',
      href: '/community/top-hunters',
      description: 'Most active community members'
    },
    {
      icon: Users,
      label: 'Community Guidelines',
      href: '/community/guidelines',
      description: 'Rules and best practices'
    }
  ]

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
          Community
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-3 transition-colors",
                  active 
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30" 
                    : "hover:bg-background/50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn(
                    "h-5 w-5",
                    active ? "text-blue-300" : "text-muted-foreground"
                  )} />
                  <div className="text-left">
                    <div className={cn(
                      "font-medium",
                      active ? "text-blue-300" : ""
                    )}>{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          )
        })}
        
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Community Stats</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <div className={`font-semibold text-blue-400 transition-all duration-300 ${stats ? 'animate-pulse' : ''}`}>
                  {stats ? formatNumber(stats.activeMembers) : '...'}
                </div>
                <div>Active Members</div>
              </div>
              <div>
                <div className={`font-semibold text-green-400 transition-all duration-300 ${stats ? 'animate-pulse' : ''}`}>
                  {stats ? formatNumber(stats.postsToday) : '...'}
                </div>
                <div>Posts Today</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
