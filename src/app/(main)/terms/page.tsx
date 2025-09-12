"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeftIcon, HomeIcon } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-purple-400 transition-colors">
            <HomeIcon className="h-4 w-4" />
          </Link>
          <span>/</span>
          <span className="text-purple-400">Terms</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Terms and Conditions</h1>
          <p className="text-gray-400 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Introduction */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed">
              Welcome to Mobile Game Hunt! These Terms and Conditions ("Terms") govern your use of our platform 
              and services. By accessing or using Mobile Game Hunt, you agree to be bound by these Terms. 
              If you disagree with any part of these terms, you may not access the service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Mobile Game Hunt is a platform that allows users to discover, submit, vote on, and discuss mobile games. 
              These Terms apply to all visitors, users, and others who access or use the service.
            </p>
          </CardContent>
        </Card>

        {/* Use of Service */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">2. Use of Service</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              You may use our service to:
            </p>
            <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-2 ml-4">
              <li>Browse and discover mobile games</li>
              <li>Submit games for community review</li>
              <li>Vote on games you like</li>
              <li>Comment and engage with the community</li>
              <li>Access analytics and insights</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-purple-400">Age Restrictions:</strong> You must be at least 13 years old to use this service. 
              If you are under 18, you must have parental consent to create an account.
            </p>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">3. User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              As a user of Mobile Game Hunt, you agree to:
            </p>
            <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and truthful information</li>
              <li>Not submit illegal, harmful, or inappropriate content</li>
              <li>Respect other users and community guidelines</li>
              <li>Not engage in spam, harassment, or abuse</li>
              <li>Not attempt to hack or compromise the platform</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Violation of these responsibilities may result in account suspension or termination.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">4. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-purple-400">Platform Content:</strong> The Mobile Game Hunt platform, including its design, 
              logo, and functionality, is protected by intellectual property laws.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-purple-400">User Content:</strong> When you submit games or content, you retain ownership 
              of your intellectual property. By submitting content, you grant us a license to display, distribute, 
              and promote your content on our platform.
            </p>
            <p className="text-gray-300 leading-relaxed">
              You may not use our platform's content or design without explicit written permission.
            </p>
          </CardContent>
        </Card>

        {/* Limitations of Liability */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">5. Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              Mobile Game Hunt is provided "as-is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-2 ml-4">
              <li>Continuous availability of the service</li>
              <li>Accuracy of user-submitted content</li>
              <li>Compatibility with all devices or browsers</li>
              <li>Protection against all security threats</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We are not liable for any damages arising from your use of the platform, including but not limited to 
              direct, indirect, incidental, or consequential damages.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">6. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes 
              through the platform or email. Your continued use of the service after changes constitutes acceptance 
              of the new Terms. If you disagree with the changes, you may discontinue use of the service.
            </p>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="rounded-xl p-6 mb-8 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">7. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-purple-400">Email:</strong> legal@mobilegamehunt.com<br />
              <strong className="text-purple-400">Subject:</strong> Terms and Conditions Inquiry
            </p>
          </CardContent>
        </Card>

        {/* Back to Home Button */}
        <div className="text-center">
          <Link href="/">
            <Button 
              variant="outline" 
              className="text-purple-400 hover:text-white border-purple-400/30 hover:border-purple-400 hover:shadow-[0_0_18px_rgba(168,85,247,0.25)] transition-all duration-200 hover:bg-purple-400/10"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
