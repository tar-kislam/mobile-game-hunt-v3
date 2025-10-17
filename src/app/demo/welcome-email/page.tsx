import { render } from '@react-email/render'
import React from 'react'
import WelcomeEmail from '@/emails/WelcomeEmail'

export const dynamic = 'force-dynamic'

export default async function WelcomeEmailPreviewPage() {
  const html = await render(React.createElement(WelcomeEmail))

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome Email Preview</h1>
        <p className="text-sm text-gray-400 mb-6">This is a live render of the HTML sent to users.</p>
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <iframe
            title="Welcome Email"
            srcDoc={html}
            sandbox="allow-same-origin"
            className="w-full"
            style={{ height: '900px', background: '#0e0e12' }}
          />
        </div>
      </div>
    </div>
  )
}


