"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import PillNav from "@/components/ui/pill-nav"

export function Header() {
  const { data: session, status } = useSession()

  const baseNavItems = [
    { label: "Home", href: "/" },
    { label: "All Games", href: "/products" },
    { label: "Community", href: "/community" },
    { label: "Advertise", href: "/advertise" },
    { label: "Calendar", href: "/calendar" }
  ]

  const navItems = session ? [
    ...baseNavItems,
    { label: "Dashboard", href: "/dashboard" }
  ] : baseNavItems

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/35">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Hidden on desktop when using PillNav */}
          <Link href="/" className="flex md:hidden items-center space-x-2 group">
            <div className="bg-neutral-900 p-1 rounded-lg drop-shadow-lg group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(128,90,213,0.8)] transition-all duration-200">
              <Image
                src="/logo.png"
                alt="Mobile Game Hunt Logo"
                width={40}
                height={40}
                className="rounded-md"
              />
            </div>
            <span className="font-bold text-xl">Mobile Game Hunt</span>
          </Link>

          {/* Pill Navigation */}
          <div className="flex-1 md:flex-none md:mx-auto">
            <PillNav 
              items={navItems}
              className="md:justify-center"
              baseColor="hsl(var(--background))"
              pillColor="hsl(var(--card))"
              hoveredPillTextColor="hsl(var(--card-foreground))"
              pillTextColor="hsl(var(--muted-foreground))"
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded-2xl" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <Button asChild className="rounded-2xl shadow-soft">
                  <Link href="/submit">Submit Game</Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {session.user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl shadow-large" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                        {session.user?.role === "ADMIN" && (
                          <Badge variant="secondary" className="rounded-full w-fit text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/games">My Games</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      onClick={() => signOut()}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="rounded-2xl">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild className="rounded-2xl shadow-soft">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
