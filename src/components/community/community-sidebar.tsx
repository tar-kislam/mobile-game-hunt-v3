import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, User, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

export function CommunitySidebar() {
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
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
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
                <div className="font-semibold text-blue-400">1.2K</div>
                <div>Active Members</div>
              </div>
              <div>
                <div className="font-semibold text-green-400">456</div>
                <div>Posts Today</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
