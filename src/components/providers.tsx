"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { ReactNode, useEffect, useState } from "react"
import { PageTracking } from "@/components/analytics/PageTracking"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        themes={["dark"]}
        disableTransitionOnChange
        storageKey="mobile-game-hunt-theme"
      >
        <PageTracking />
        {children}
        <Toaster 
          theme="dark"
          position="top-right"
          offset={isMobile ? "60px" : "80px"}
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: 'white',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
            },
            className: 'toast-custom',
            duration: 3500,
          }}
          expand={true}
          richColors={true}
          closeButton={false}
          visibleToasts={5}
          gap={8}
        />
      </ThemeProvider>
    </SessionProvider>
  )
}
