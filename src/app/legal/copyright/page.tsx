import { Metadata } from "next"
import Link from "next/link"
import { Shield, Mail, FileText, AlertTriangle, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LegalDisclaimer } from "@/components/legal/LegalDisclaimer"

export const metadata: Metadata = {
  title: "Copyright & DMCA Policy | Mobile Game Hunt",
  description: "Copyright policy and takedown process for Mobile Game Hunt. Learn how we respect intellectual property rights and handle infringement claims.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Copyright & DMCA Policy | Mobile Game Hunt",
    description: "Policy & takedown process for Mobile Game Hunt",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Copyright & DMCA Policy | Mobile Game Hunt",
    description: "Policy & takedown process for Mobile Game Hunt",
  },
}

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@mobilegamehunt.com"
const LAST_UPDATED = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
})

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 mb-4">
            <Scale className="h-10 w-10 text-purple-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Copyright & DMCA Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mobile Game Hunt respects the intellectual property rights of others and expects our users to do the same.
          </p>
        </div>

        {/* Legal Disclaimer */}
        <LegalDisclaimer className="mb-12" />

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Our Commitment</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Mobile Game Hunt is an independent discovery platform that helps players find amazing mobile games. 
                    We do not host, distribute, or provide direct downloads of any game files, APKs, IPAs, or other 
                    copyrighted materials. We merely provide links to official app store listings and promotional materials 
                    submitted by developers or sourced from publicly available information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-white/10" />

          {/* Reporting Infringement */}
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Reporting Copyright Infringement</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    If you believe that your copyrighted work has been used on Mobile Game Hunt in a way that 
                    constitutes copyright infringement, please provide us with the following information:
                  </p>
                  
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>A description of the copyrighted work that you claim has been infringed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>A description of where the material that you claim is infringing is located on our site</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Your contact information (email address, phone number, and physical address)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>A statement that you have a good faith belief that the disputed use is not authorized</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>A statement, under penalty of perjury, that the information is accurate and that you are authorized to act on behalf of the copyright owner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Your physical or electronic signature</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-sm font-medium mb-1">Contact Us</p>
                        <a 
                          href={`mailto:${CONTACT_EMAIL}`}
                          className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                        >
                          {CONTACT_EMAIL}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-white/10" />

          {/* Takedown Process */}
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Takedown Process</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Upon receiving a valid copyright infringement notice, we will:
                  </p>
                  
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center min-w-[24px] h-6 rounded-full bg-purple-500/20 text-purple-400 font-semibold text-xs">
                        1
                      </span>
                      <span>Review your claim promptly to determine its validity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center min-w-[24px] h-6 rounded-full bg-purple-500/20 text-purple-400 font-semibold text-xs">
                        2
                      </span>
                      <span>Remove or disable access to the allegedly infringing material if the claim is valid</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center min-w-[24px] h-6 rounded-full bg-purple-500/20 text-purple-400 font-semibold text-xs">
                        3
                      </span>
                      <span>Notify the user who submitted the content about the takedown</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex items-center justify-center min-w-[24px] h-6 rounded-full bg-purple-500/20 text-purple-400 font-semibold text-xs">
                        4
                      </span>
                      <span>Provide an opportunity for counter-notification if appropriate</span>
                    </li>
                  </ol>

                  <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-200/90">
                      <strong>Note:</strong> We may remove links, thumbnails, descriptions, or entire game listings 
                      based on the nature of the infringement claim. Our goal is to balance copyright protection 
                      with legitimate discovery and promotion of mobile games.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-white/10" />

          {/* Third-Party Assets */}
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Third-Party Assets & Trademarks</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      All game titles, trademarks, logos, screenshots, and other promotional materials displayed 
                      on Mobile Game Hunt are the property of their respective owners. We use these materials 
                      under the principle of fair use for the purpose of:
                    </p>
                    
                    <ul className="space-y-2 text-sm ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>News reporting and commentary about mobile games</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>Criticism and review of games</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>Educational purposes about the mobile gaming industry</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>Transformative use in creating a discovery and community platform</span>
                      </li>
                    </ul>

                    <p>
                      <strong className="text-white">We do not:</strong>
                    </p>
                    
                    <ul className="space-y-2 text-sm ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✕</span>
                        <span>Host or distribute APK, IPA, or other game installation files</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✕</span>
                        <span>Provide downloads of copyrighted game content or assets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✕</span>
                        <span>Facilitate piracy or unauthorized distribution of games</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✕</span>
                        <span>Claim ownership of any third-party trademarks or copyrighted materials</span>
                      </li>
                    </ul>

                    <p className="pt-2">
                      All links direct users to official app store listings (Apple App Store, Google Play Store) 
                      or the game developer&apos;s official website. We encourage users to support developers by 
                      downloading games through official channels only.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer with Back Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 pb-4">
            <p className="text-sm text-muted-foreground">
              Last updated: {LAST_UPDATED}
            </p>
            <Link 
              href="/about"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back to About
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

