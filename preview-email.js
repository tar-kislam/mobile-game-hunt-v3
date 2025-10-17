import { render } from '@react-email/render'
import React from 'react'
import WelcomeEmail from './src/emails/WelcomeEmail'

async function previewEmail() {
  try {
    const html = await render(React.createElement(WelcomeEmail))
    
    // Write HTML to file for preview
    const fs = require('fs')
    const path = require('path')
    
    const outputPath = path.join(__dirname, 'email-preview.html')
    fs.writeFileSync(outputPath, html)
    
    console.log('✅ Email template rendered successfully!')
    console.log(`📁 Preview saved to: ${outputPath}`)
    console.log('🌐 Open the file in your browser to see the email template')
    
  } catch (error) {
    console.error('❌ Error rendering email:', error)
  }
}

previewEmail()
