import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import React from 'react'
import WelcomeEmail from '@/emails/WelcomeEmail'

// SMTP Configuration
const getTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.error('[EMAIL] Missing SMTP configuration')
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass }
  })
}

// Welcome Email HTML Template
const getWelcomeEmailHTML = (email: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Mobile Game Hunt</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #0e0e12 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #0e0e12;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #6c63ff 0%, #9c88ff 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-message {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .welcome-message h2 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #6c63ff;
        }
        
        .welcome-message p {
            font-size: 16px;
            color: #b0b0b0;
            margin-bottom: 20px;
        }
        
        .features {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin: 40px 0;
        }
        
        .feature {
            display: flex;
            align-items: center;
            padding: 20px;
            background: rgba(108, 99, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(108, 99, 255, 0.1);
        }
        
        .feature-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6c63ff, #9c88ff);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 18px;
        }
        
        .feature-text {
            flex: 1;
        }
        
        .feature-text h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .feature-text p {
            font-size: 14px;
            color: #b0b0b0;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(156, 136, 255, 0.1) 100%);
            border-radius: 16px;
            border: 1px solid rgba(108, 99, 255, 0.2);
        }
        
        .cta-button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #6c63ff 0%, #9c88ff 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(108, 99, 255, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(108, 99, 255, 0.4);
        }
        
        .footer {
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
        }
        
        .footer p {
            font-size: 14px;
            color: #888;
            margin-bottom: 10px;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
        }
        
        .social-link {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: rgba(108, 99, 255, 0.1);
            border-radius: 10px;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c63ff;
            transition: all 0.3s ease;
        }
        
        .social-link:hover {
            background: rgba(108, 99, 255, 0.2);
            transform: translateY(-2px);
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .welcome-message h2 {
                font-size: 20px;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
            
            .feature {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎮</div>
            <h1>Welcome to Mobile Game Hunt</h1>
            <p>Your gateway to discovering amazing mobile games</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Hey there, game hunter! 👋</h2>
                <p>Thanks for joining our community of mobile gaming enthusiasts. You're now part of an exclusive group that gets first access to the latest and greatest mobile games.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <div class="feature-text">
                        <h3>Early Access</h3>
                        <p>Be the first to discover new games before they hit the mainstream</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-text">
                        <h3>Curated Content</h3>
                        <p>Hand-picked games from indie developers and established studios</p>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">
                        <h3>Personalized Recommendations</h3>
                        <p>Get game suggestions tailored to your preferences</p>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <h3 style="margin-bottom: 15px; color: #6c63ff;">Ready to start hunting?</h3>
                <p style="margin-bottom: 25px; color: #b0b0b0;">Explore our collection of amazing mobile games and join the community</p>
                <a href="${baseUrl}" class="cta-button">Start Exploring Games</a>
            </div>
        </div>
        
        <div class="footer">
            <p>You're receiving this email because you subscribed to Mobile Game Hunt newsletter.</p>
            <p>If you no longer wish to receive these emails, you can <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #6c63ff;">unsubscribe here</a>.</p>
            
            <div class="social-links">
                <a href="https://twitter.com/mobilegamehunt" class="social-link">🐦</a>
                <a href="https://discord.gg/zahqtja5e9" class="social-link">💬</a>
                <a href="https://instagram.com/mobilegamehunt" class="social-link">📷</a>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

// Send Welcome Email Function
export async function sendWelcomeEmail(to: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[EMAIL] Sending welcome email to: ${to}`)
    
    const transporter = getTransporter()
    if (!transporter) {
      const error = 'SMTP not configured'
      console.error(`[EMAIL] ${error}`)
      return { success: false, error }
    }
    const html = render(React.createElement(WelcomeEmail))
    const from = process.env.SMTP_FROM || 'info@mobilegamehunt.com'
    
    // Ensure html is a string, not a Promise
    const htmlContent = await html

    const mailOptions = {
      from: '"MobileGameHunt" <info@mobilegamehunt.com>',
      to,
      subject: 'Welcome to Mobile Game Hunt',
      html: htmlContent,
      text: 'Thanks for joining MobileGameHunt! Visit mobilegamehunt.com to explore new mobile games.'
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] Welcome email sent successfully to ${to}. MessageId: ${result.messageId || 'N/A'}`)
    
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[EMAIL] Failed to send welcome email to ${to}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Support Message Email HTML Template
const getSupportMessageHTML = (email: string, message: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Support Message - Mobile Game Hunt</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #0e0e12 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #0e0e12;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #6c63ff 0%, #9c88ff 100%);
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .message-details {
            background: rgba(108, 99, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(108, 99, 255, 0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 15px;
        }
        
        .detail-row:last-child {
            margin-bottom: 0;
        }
        
        .detail-label {
            font-weight: 600;
            color: #6c63ff;
            min-width: 80px;
            margin-right: 15px;
        }
        
        .detail-value {
            flex: 1;
            color: #ffffff;
        }
        
        .message-content {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #6c63ff;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            line-height: 1.5;
        }
        
        .footer {
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
            font-size: 12px;
            color: #888;
        }
        
        .timestamp {
            color: #6c63ff;
            font-size: 12px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🆘 New Support Message</h1>
            <p>Mobile Game Hunt Support System</p>
        </div>
        
        <div class="content">
            <div class="message-details">
                <div class="detail-row">
                    <div class="detail-label">From:</div>
                    <div class="detail-value">${email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Subject:</div>
                    <div class="detail-value">Support Request via Website</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Time:</div>
                    <div class="detail-value">${new Date().toLocaleString('en-US', { 
                        timeZone: 'UTC',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })} UTC</div>
                </div>
            </div>
            
            <div class="message-content">${message}</div>
            
            <div class="timestamp">
                This message was automatically generated by the Mobile Game Hunt support system.
            </div>
        </div>
        
        <div class="footer">
            <p>Mobile Game Hunt Support System</p>
            <p>Reply directly to this email to respond to the user.</p>
        </div>
    </div>
</body>
</html>
  `
}

// Send Support Message Email Function
export async function sendSupportMessageEmail(fromEmail: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[EMAIL] Sending support message email from: ${fromEmail}`)
    
    const transporter = getTransporter()
    if (!transporter) {
      const error = 'SMTP not configured'
      console.error(`[EMAIL] ${error}`)
      return { success: false, error }
    }

    const html = getSupportMessageHTML(fromEmail, message)
    const from = process.env.SMTP_FROM || 'info@mobilegamehunt.com'
    
    const mailOptions = {
      from: '"MobileGameHunt" <info@mobilegamehunt.com>',
      to: 'info@mobilegamehunt.com', // Support messages go to info@mobilegamehunt.com
      subject: `🆘 Support Request from ${fromEmail}`,
      html,
      text: `Support request from: ${fromEmail}\n\nMessage:\n${message}`,
      replyTo: fromEmail // Allow direct reply to the user
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] Support message sent successfully from ${fromEmail}. MessageId: ${result.messageId}`)
    
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[EMAIL] Failed to send support message from ${fromEmail}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// User Feedback Email HTML Template
const getUserFeedbackEmailHTML = (displayName: string) => {
  const safeName = displayName || 'there'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We'd love your feedback</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #0b0c10;
      color: #f5f5f5;
    }
    .wrapper {
      width: 100%;
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .card {
      max-width: 640px;
      margin: 0 auto;
      background: #11131a;
      border-radius: 16px;
      padding: 24px 20px 20px;
      box-sizing: border-box;
      border: 1px solid rgba(255,255,255,0.06);
    }
    h1 {
      font-size: 20px;
      margin: 0 0 12px 0;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 12px 0;
      color: #d1d5db;
    }
    .highlight {
      color: #f97316;
      font-weight: 600;
    }
    .cta {
      margin: 20px 0 16px;
      text-align: left;
    }
    .cta-button {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 999px;
      background: linear-gradient(135deg,#7c3aed,#ec4899);
      color: #ffffff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .footer {
      font-size: 12px;
      color: #6b7280;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <p>Hi <span class="highlight">${safeName}</span>,</p>
      <p>
        Thanks again for being part of <span class="highlight">Mobile Game Hunt</span>.
        We're always trying to make the platform better for players and developers.
      </p>
      <p>
        If you have a moment, we'd love to hear what you enjoy, what feels confusing,
        or what you think is missing – anything that would help us improve your experience.
      </p>
      <div class="cta">
        <a class="cta-button" href="mailto:info@mobilegamehunt.com?subject=Feedback%20for%20Mobile%20Game%20Hunt">
          Share your thoughts
        </a>
      </div>
      <p>
        Short or long, every bit of feedback helps us build a better home for mobile games.
      </p>
      <p class="footer">
        Thank you for being with us,<br/>
        – The Mobile Game Hunt Team
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Send Feedback Email to a single user
export async function sendUserFeedbackEmail(to: string, displayName?: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[EMAIL] Sending user feedback email to: ${to}`)

    const transporter = getTransporter()
    if (!transporter) {
      const error = 'SMTP not configured'
      console.error(`[EMAIL] ${error}`)
      return { success: false, error }
    }

    const nameForTemplate = displayName && displayName.trim().length > 0 ? displayName.trim() : to.split('@')[0]
    const html = getUserFeedbackEmailHTML(nameForTemplate)
    const from = process.env.SMTP_FROM || 'info@mobilegamehunt.com'

    const mailOptions = {
      from: '"MobileGameHunt" <info@mobilegamehunt.com>',
      to,
      subject: "We'd love your feedback about Mobile Game Hunt",
      html,
      text: `Hi ${nameForTemplate},\n\nThanks again for being part of Mobile Game Hunt. We'd love to hear what you enjoy, what feels confusing, or what you think is missing – anything that would help us improve your experience.\n\nYou can simply reply to this email or write to info@mobilegamehunt.com.\n\nThank you for being with us,\n– The Mobile Game Hunt Team`,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] User feedback email sent successfully to ${to}. MessageId: ${result.messageId || 'N/A'}`)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[EMAIL] Failed to send user feedback email to ${to}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

export const getDisplayNameForUser = (user: { name?: string | null; username?: string | null; email: string }) => {
  if (user.name && user.name.trim().length > 0) {
    return user.name.trim()
  }
  if (user.username && user.username.trim().length > 0) {
    return user.username.trim()
  }
  return user.email.split('@')[0]
}

// Base64 encoded SVG icons for email compatibility
const SOCIAL_ICON_URLS = {
  x: 'https://mobilegamehunt.com/email/social/x.png',
  instagram: 'https://mobilegamehunt.com/email/social/instagram.png',
  tiktok: 'https://mobilegamehunt.com/email/social/tiktok.png',
  reddit: 'https://mobilegamehunt.com/email/social/reddit.png',
  discord: 'https://mobilegamehunt.com/email/social/discord.png'
}

const FOX_ICON_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNTkiIHZpZXdCb3g9IjAgMCA2NCA1OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyOS41IiByPSIyOC41IiBmaWxsPSJ1cmwoI2EpIi8+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzY5MDVGRiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwQjhGRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZD0iTTMyIDQxYy05LjM4IDAtMTcuMTEtNS42LTIwLjYzLTE0LjA3Yy0uMzU3LS44OTUuMTQzLTEuOTIyIDEuMDk5LTIuMTg1bDIuMTk5LS41NzZjLjUwNi0uMTMyLjk4NS4yNDggMS4wOTcuNzU5QzE2Ljg2IDI3LjkxIDI0Ljk0IDM3IDI5LjUgMzdjNC41NiAwIDEyLjY0LTkuMDkgMTMuODM4LTEzLjA3Yy4xMDgtLjUxMS41OS0uODkyIDEuMDk3LS43NTlsMi4xOTkuNTc2Yy45NTYuMjYzIDEuNDU1IDEuMjkgMS4xMDIgMi4xODVDNDkuMTEgMzUuNCA0MS4zOCA0MSAzMiA0MXoiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iLjkiLz48cGF0aCBkPSJNMjguMDUgMzEuNTNMNy42OSAyMC4zOGMtLjk5LS41My0uOTMtMS45NjUuMTEtMi40MTRsMy41MTUtMS42ODljLjM1LS4xNjguNzgyLS4xNTkgMS4xMjEuMDE4TDMyIDI2bDE5LjU2LTEwLjAwOThjLjM0My0uMTc1Ljc3NS0uMTg2IDEuMTItLjAyNGwzLjQ5MiAxLjY1OGMxLjA0Ni40OTQgMS4xNjIgMS45My4xODYgMi40NjVMMzcgMzEuNTN2Ny40NzRDMzcuMDA5IDQ2LjY2OCAzMy40NDQgNDkgMzIgNDljLTEuNDQ0IDAtNS4wMDktMi40MDItNS4wMDktMTAuMzk2VjMxLjUzeiIgZmlsbD0iI0ZGRkZGRiIvPjwvc3ZnPg=='

export const getSocialPromoEmailHTML = (displayName: string) => {
  const safeName = displayName?.trim() || 'there'
  const socialCards = [
    { name: 'X (Twitter)', handle: '@mobilegamehunt', url: 'https://x.com/mobilegamehunt', iconUrl: SOCIAL_ICON_URLS.x, cta: 'Follow' },
    { name: 'Instagram', handle: '@mobilegamehunt', url: 'https://instagram.com/mobilegamehunt', iconUrl: SOCIAL_ICON_URLS.instagram, cta: 'Follow' },
    { name: 'TikTok', handle: '@mobilegamehunt', url: 'https://www.tiktok.com/@mobilegamehunt', iconUrl: SOCIAL_ICON_URLS.tiktok, cta: 'Follow' },
    { name: 'Reddit', handle: 'r/MobileGameHunt', url: 'https://www.reddit.com/r/MobileGameHunt/', iconUrl: SOCIAL_ICON_URLS.reddit, cta: 'Join' },
    { name: 'Discord', handle: 'Indie Dev Hangout', url: 'https://discord.gg/zahqtja5e9', iconUrl: SOCIAL_ICON_URLS.discord, cta: 'Join Server' }
  ]
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>MobileGameHunt – Connect With Us</title>
  <style>
    body, table, td { margin: 0; padding: 0; border-collapse: collapse; font-family: 'Inter', 'Segoe UI', Tahoma, Arial, sans-serif; }
    img { display: block; border: 0; }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#050505;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#0b0b14;border-radius:26px;border:1px solid rgba(149,114,255,0.35);box-shadow:0 18px 60px rgba(64,16,144,0.4),inset 0 0 30px rgba(17,220,255,0.08);overflow:hidden;">
          <tr>
            <td align="center" style="padding:42px 24px 32px;background:radial-gradient(160% 160% at 10% 5%, rgba(124,58,237,0.35), transparent),radial-gradient(160% 160% at 90% 5%, rgba(6,182,212,0.35), transparent),#07070d;">
              <img src="${FOX_ICON_BASE64}" alt="MobileGameHunt" width="64" height="59" style="margin-bottom:10px;" />
              <p style="margin:0;font-size:22px;letter-spacing:1px;text-transform:uppercase;color:#fdfdff;font-weight:600;">MobileGameHunt</p>
              <p style="margin:6px 0 0;font-size:12px;letter-spacing:4px;color:#8ecbff;">NEON COMMUNITY SIGNAL</p>
            </td>
          </tr>
          <tr>
            <td style="height:1px;background:linear-gradient(90deg,rgba(122,67,255,0) 0%,rgba(122,67,255,0.7) 20%,rgba(17,192,255,0.7) 80%,rgba(17,192,255,0) 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 26px 44px;">
              <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#e9edff;">Hi ${safeName},</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#c6cce6;">
                We're building the most indie-friendly spot for discovering mobile games. If you'd like to support the platform,
                we'd love to connect with you across our channels 💜
              </p>
              <p style="margin:28px 0 12px;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#8fb5ff;">Connect With Us</p>

              ${socialCards.map((card, idx) => `${idx > 0 ? spacerRow() : ''}${renderSocialCard(card)}`).join('')}

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                <tr>
                  <td style="padding:18px;border-radius:18px;border:1px dashed rgba(255,255,255,0.18);background:rgba(255,255,255,0.03);font-size:13px;line-height:1.6;color:#aeb7d9;">
                    Prefer inbox updates? Just reply to this email anytime and we’ll keep you in the loop. Every follow, like, or share helps indie teams reach more players. Thanks for exploring with us.
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:14px;color:#dde3ff;">— The MobileGameHunt Team</p>
              <p style="margin:20px 0 0;font-size:11px;line-height:1.6;text-align:center;color:#828bb0;">
                You're receiving this email because you joined MobileGameHunt.<br/>Update preferences or unsubscribe anytime.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

const spacerRow = () =>
  '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td height="16" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>'

const renderSocialCard = (card: { name: string; handle: string; url: string; iconUrl: string; cta: string }) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#141420;border:1px solid rgba(255,255,255,0.08);border-radius:20px;">
    <tr>
      <td align="center" style="padding:20px 18px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-bottom:14px;">
              <img src="${card.iconUrl}" alt="${card.name}" width="32" height="32" style="display:block;margin:0 auto 8px auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size:17px;font-weight:600;color:#f6f8ff;padding-bottom:4px;">${card.name}</td>
          </tr>
          <tr>
            <td align="center" style="font-size:13px;letter-spacing:0.3px;color:#96a0c2;padding-bottom:18px;">${card.handle}</td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background:linear-gradient(120deg,#7c2fff,#1cb8ff);border-radius:999px;">
                    <a href="${card.url}" target="_blank" rel="noopener noreferrer" style="display:block;padding:12px 18px;font-size:14px;font-weight:600;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      ${card.cta}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`

export async function sendSocialPromoEmail(to: string, displayName: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[EMAIL] Sending social promo email to: ${to}`)
    const transporter = getTransporter()
    if (!transporter) {
      const error = 'SMTP not configured'
      console.error('[EMAIL]', error)
      return { success: false, error }
    }

    const name = displayName && displayName.trim().length > 0 ? displayName.trim() : to.split('@')[0]
    const html = getSocialPromoEmailHTML(name)
    const mailOptions = {
      from: '"MobileGameHunt" <info@mobilegamehunt.com>',
      to,
      subject: "Let’s stay connected on social media 💜",
      html
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] Social promo email sent to ${to}. MessageId: ${result.messageId || 'N/A'}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[EMAIL] Failed to send social promo email to ${to}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}
// Test Email Configuration
export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter()
    if (!transporter) {
      return { success: false, error: 'SMTP not configured' }
    }

    await transporter.verify()
    console.log('[EMAIL] SMTP configuration verified successfully')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'SMTP verification failed'
    console.error('[EMAIL] SMTP verification failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
