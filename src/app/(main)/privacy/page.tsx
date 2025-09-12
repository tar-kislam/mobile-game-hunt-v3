"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeftIcon, HomeIcon } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-purple-400 transition-colors">
            <HomeIcon className="h-4 w-4" />
          </Link>
          <span>/</span>
          <span className="text-purple-400">Privacy</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Introduction */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed">
              At Mobile Game Hunt, we are committed to protecting your privacy and personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using Mobile Game Hunt, you consent to the data practices described in this policy. 
              We encourage you to read this policy carefully to understand our practices regarding your personal information.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect several types of information to provide and improve our service:
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-purple-300 font-semibold mb-2">Account Information:</h4>
                <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>Profile image (optional)</li>
                  <li>Username and preferences</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-purple-300 font-semibold mb-2">Game Submission Information:</h4>
                <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-1 ml-4">
                  <li>Game titles, descriptions, and metadata</li>
                  <li>Platform information and links</li>
                  <li>Screenshots and promotional materials</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-purple-300 font-semibold mb-2">Analytics Data:</h4>
                <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-1 ml-4">
                  <li>Page views and clicks</li>
                  <li>Voting and engagement metrics</li>
                  <li>User behavior patterns</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-purple-300 font-semibold mb-2">Technical Information:</h4>
                <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-1 ml-4">
                  <li>Session cookies for authentication</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">3. How We Use Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our platform services</li>
              <li>Enable community features like voting and commenting</li>
              <li>Show analytics and insights for submitted games</li>
              <li>Improve our platform and develop new features</li>
              <li>Send important updates and notifications</li>
              <li>Ensure platform security and prevent abuse</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-purple-400">Important:</strong> We do not sell your personal data to third parties. 
              Your information is used solely to provide and improve our services.
            </p>
          </CardContent>
        </Card>

        {/* Data Sharing & Disclosure */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">4. Data Sharing & Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-purple-300">Service Providers:</strong> Hosting, analytics, and email services</li>
              <li><strong className="text-purple-300">Legal Requirements:</strong> When required by law or legal process</li>
              <li><strong className="text-purple-300">Platform Safety:</strong> To prevent fraud, abuse, or security threats</li>
              <li><strong className="text-purple-300">Business Transfers:</strong> In case of merger or acquisition</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We ensure all third-party providers maintain appropriate security measures and use your data 
              only for the purposes we specify.
            </p>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">5. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement comprehensive security measures to protect your data:
            </p>
            <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-2 ml-4">
              <li>Secure database storage with encryption</li>
              <li>Password hashing and secure authentication</li>
              <li>Access restrictions and user permissions</li>
              <li>Regular security audits and updates</li>
              <li>HTTPS encryption for all data transmission</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              While we strive to protect your information, no method of transmission over the internet 
              is 100% secure. We cannot guarantee absolute security but work continuously to improve our safeguards.
            </p>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">6. User Rights</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="text-gray-300 leading-relaxed list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-purple-300">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-purple-300">Correction:</strong> Update or correct inaccurate information</li>
              <li><strong className="text-purple-300">Deletion:</strong> Request deletion of your account and data</li>
              <li><strong className="text-purple-300">Portability:</strong> Export your data in a readable format</li>
              <li><strong className="text-purple-300">Restriction:</strong> Limit how we process your data</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@mobilegamehunt.com. We will respond to your 
              request within 30 days and may require verification of your identity.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card className="rounded-xl p-6 mb-6 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">7. Changes to Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last updated" date. We encourage you 
              to review this policy periodically for any changes. Your continued use of the service after 
              changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="rounded-xl p-6 mb-8 bg-neutral-900 border-neutral-800 hover:border-purple-500 transition-colors">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-purple-400 text-xl font-bold">8. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-purple-400">Email:</strong> privacy@mobilegamehunt.com<br />
              <strong className="text-purple-400">Subject:</strong> Privacy Policy Inquiry<br />
              <strong className="text-purple-400">Response Time:</strong> Within 30 days
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
