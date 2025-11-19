import { Header } from "@/components/layout/header"
import { SiteTourProvider } from "@/components/layout/site-tour-provider"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <SiteTourProvider />
    </div>
  )
}
