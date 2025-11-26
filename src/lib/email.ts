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
const SOCIAL_ICONS_BASE64 = {
  x: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4LjI0NDcgNy4wNDEwMkMxNy4xMDk1IDYuODI0NjcgMTUuOTUyMyA2LjY1ODMzIDE0Ljc4NDIgNi41NDE2N0MxNS45NTIzIDUuODI1IDYuNzEwNTMgMi4wODMzMyA0LjYyNDk3IDQuMTY4OTNDMy4wNDE2NyA1Ljc1MjIyIDIuNzI5MTcgOC4xMjUgMy45MTY2NyA5Ljg3NUMzLjMzMzMzIDEwLjA0MTcgMi43NzA4MyA5Ljk1ODMzIDIuMjUwMDAgOS43MDgzM0MxLjY2NjY3IDkuNDE2NjcgMS4xMjUwMCA5LjA0MTY3IDAuNjI1MDAwIDguNjI1MDBDMC42MjUwMDAgOC42NjY2NyAwLjYyNTAwMCA4LjcwODMzIDAuNjI1MDAwIDguNzUwMDBDMC42NjY2NjcgMTMuMDgzMyA0LjI5MTY3IDE2LjkxNjcgOC45NTgzMyAxNy41NDE3QzguNDU4MzMgMTcuNjY2NyA3LjkzNzUwIDE3Ljc1IDcuNDE2NjcgMTcuNzkxN0M2LjI5MTY3IDE5LjI1IDQuNTQxNjcgMjAuMjA4MyAyLjYyNTAwIDIwLjIwODNDMi4yMDgzMyAyMC4yMDgzIDEuNzkxNjcgMjAuMTY2NyAxLjM3NTAwIDIwLjA4MzNDMy4xNjY2NyAyMS4yMDgzIDUuMjkxNjcgMjEuODc1IDcuNDU4MzMgMjEuODc1QzE1LjYyNTAgMjEuODc1IDIyLjA0MTcgMTQuNzA4MyAyMi4wNDE3IDYuMDQxNjdDMjIuMDQxNyA1Ljc5MTY3IDIyLjA0MTcgNS41NDE2NyAyMi4wMDAwIDUuMjkxNjdDMjMuMDgzMyA0LjU0MTY3IDI0LjAwMDAgMy41ODMzMyAyNC42NjY3IDIuNDU4MzNDMjMuNjI1MCAyLjg3NSAyMi41MjA4IDMuMTI1IDIxLjM3NTAgMy4yMDgzM0MyMi41ODMzIDIuNDU4MzMgMjMuNDU4MyAxLjI5MTY3IDIzLjg3NTAgMC4wNDE2NjY3QzIyLjc3MDggMC40NTgzMzMgMjEuNTYyNSAwLjcwODMzMyAyMC4yOTE3IDAuODc1MDAwQzE5LjEyNTAgLTAuMjkxNjY3IDE3LjU0MTcgLTAuMjkxNjY3IDE2LjM3NTAgMC44NzUwMDBDMTUuNjY2NyAxLjU4MzMzIDE1LjI5MTcgMi41NDE2NyAxNS4yOTE3IDMuNTQxNjdDMTUuMjkxNyAzLjY2NjY3IDE1LjI5MTcgMy43OTE2NyAxNS4zMTI1IDMuOTE2NjdDMTEuMjA4MyAzLjY2NjY3IDcuNTgzMzMgMS41ODMzMyA0Ljg3NTAwIC0xLjI1MDAwQzQuMjA4MzMgMC4wNDE2NjY3IDMuNzI5MTcgMS41ODMzMyA0LjA0MTY3IDMuMDgzMzNDMy4zMzMzMyAyLjc5MTY3IDIuNjY2NjcgMi4zNzUgMi4wODMzMyAxLjgzMzMzQzEuMzc1MDAgMy4wODMzMyAxLjY2NjY3IDQuODMzMzMgMi45MTY2NyA1LjU0MTY3QzIuMzMzMzMgNS41MDAwMCAxLjc5MTY3IDUuMzMzMzMgMS4yOTE2NyA1LjA0MTY3QzEuMjkxNjcgNi4wNDE2NyAxLjc5MTY3IDYuOTU4MzMgMi42MjUwMCA3LjU0MTY3QzIuMDQxNjcgNy41NDE2NyAxLjUwMDAwIDcuMzc1IDAuOTU4MzMzIDcuMDgzMzNDMC45NTgzMzMgOC4xMjUgMS40NTgzMyA5LjA0MTY3IDIuMjA4MzMgOS42MjVDMS42NjY2NyA5LjYyNSAxLjE2NjY3IDkuNDU4MzMgMC43MDgzMzMgOS4xNjY2N0MwLjcwODMzMyAxMC4xNjY3IDEuMjA4MzMgMTEuMDgzMyAyLjAwMDAwIDExLjY2NjdDMS41NDE2NyAxMS42NjY3IDEuMTI1MDAgMTEuNTQxNyAwLjc1MDAwMCAxMS4yOTE3VjExLjMzMzNDMC43NTAwMDAgMTIuMjA4MyAxLjIwODMzIDEzLjAwODMgMS45NTgzMyAxMy40NTgzQzEuNDU4MzMgMTMuNDU4MyAwLjk1ODMzMyAxMy4yOTE3IDAuNTIwODMzIDEzLjA0MTdDMC41MjA4MzMgMTMuODc1IDAuOTU4MzMzIDE0LjYyNSAxLjYyNTAwIDE1LjA0MTdDMS4xNjY2NyAxNS4wNDE3IDAuNzUwMDAwIDE0LjkxNjcgMC4zNzUwMDAgMTQuNjY2N0MwLjM3NTAwMCAxNS40MTY3IDAuODMzMzMzIDE2LjA4MzMgMS41NDE2NyAxNi40NTgzQzEuMDgzMzMgMTYuNDU4MyAwLjY2NjY2NyAxNi4zMzMzIDAuMjkxNjY3IDE2LjA4MzNDMC45NTgzMzMgMTguMjA4MyAyLjg3NTAwIDE5LjY2NjcgNS4wNDE2NyAxOS45MTY3QzMuNzA4MzMgMjAuNTgzMyAyLjIwODMzIDIwLjg3NSAwLjY2NjY2NyAyMC44NzVDMC4yMDgzMzMgMjAuODc1IC0wLjIwODMzMyAyMC44MzMzIC0wLjYyNTAwMCAyMC43NTgzQzEuNTQxNjcgMjIuMTI1IDMuNzA4MzMgMjIuODc1IDYuMDAwMDAgMjIuODc1QzE0LjY2NjcgMjIuODc1IDIyLjA0MTcgMTQuNzA4MyAyMi4wNDE3IDYuMDQxNjdDMjIuMDQxNyA1Ljc5MTY3IDIyLjA0MTcgNS41NDE2NyAyMi4wMDAwIDUuMjkxNjdDMjMuMDgzMyA0LjU0MTY3IDI0LjAwMDAgMy41ODMzMyAyNC42NjY3IDIuNDU4MzNDMjMuNjI1MCAyLjg3NSAyMi41MjA4IDMuMTI1IDIxLjM3NTAgMy4yMDgzM1oiIGZpbGw9IiMwRUE1RTkiLz4KPC9zdmc+',
  instagram: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuNjUyMiAyIDE1LjI2OTQgMi4yMTQyOSAxNi44MjgxIDIuNjMyMDNDMTguMzg2OCAzLjA0OTc3IDE5Ljg2ODggMy42NTY2MiAyMS4yMTIxIDQuNTg1NzlDMjIuNTU1NCA1LjUxNDk2IDIzLjcxODggNi43NDgxNyAyNC42NDgxIDguMDkxNDFDMjUuNTc3NCA5LjQzNDY1IDI2LjE4NDMgMTAuOTE2OCAyNi42MDE2IDEyLjQ3NTVDMjcuMDIwNSAxNC4wMzQyIDI3LjIzNDcgMTUuNjUyMiAyNy4yMzQ3IDE3LjMyODFDMjcuMjM0NyAxOC45OTYxIDI3LjAyMDUgMjAuNjE0MiAyNi42MDE2IDIyLjE3MjlDMjYuMTg0MyAyMy43MzE2IDI1LjU3NzQgMjUuMjEzOCAyNC42NDgxIDI2LjU1NzFDMjMuNzE4OCAyNy45MDA0IDIyLjU1NTQgMjkuMTMzNiAyMS4yMTIxIDMwLjA2MjlDMTkuODY4OCAzMC45OTIyIDE4LjM4NjggMzEuNTk5MSAxNi44MjgxIDMyLjAxNjhDMTUuMjY5NCAzMi40MzQ1IDEzLjY1MjIgMzIuNjQ4NyAxMiAzMi42NDg3QzEwLjM0NzggMzIuNjQ4NyA4LjczMDYgMzIuNDM0NSA3LjE3MTkgMzIuMDE2OEM1LjYxMzIgMzEuNTk5MSA0LjEzMTIgMzAuOTkyMiAyLjc4NzkgMzAuMDYyOUMxLjQ0NDYgMjkuMTMzNiAwLjI4MTI1IDI3LjkwMDQgLTAuNjQ4MDQ3IDI2LjU1NzFDLTEuNTc3MzQgMjUuMjEzOCAtMi4xODQyMyAyMy43MzE2IC0yLjYwMTk3IDIyLjE3MjlDLTMuMDIwNTYgMjAuNjE0MiAtMy4yMzQ3MyAxOC45OTYxIC0zLjIzNDczIDE3LjMyODFDLTMuMjM0NzMgMTUuNjUyMiAtMy4wMjA1NiAxNC4wMzQyIC0yLjYwMTk3IDEyLjQ3NTVDLTIuMTg0MjMgMTAuOTE2OCAtMS41NzczNCA5LjQzNDY1IC0wLjY0ODA0NyA4LjA5MTQxQzAuMjgxMjUgNi43NDgxNyAxLjQ0NDYgNS41MTQ5NiAyLjc4Nzk5IDQuNTg1NzlDNC4xMzEyIDMuNjU2NjIgNS42MTMyIDMuMDQ5NzcgNy4xNzE5IDIuNjMyMDNDOC43MzA2IDIuMjE0MjkgMTAuMzQ3OCAyIDEyIDJaIiBmaWxsPSJ1cmwoI2luc3RhZ3JhbUdyYWRpZW50KSIvPgo8cGF0aCBkPSJNMTIgNi4wMDAwMUMxMy4wNTY3IDYuMDAwMDEgMTQuMDg3OSA2LjE3MTg4IDE1LjA2MjUgNi41MDk3N0MxNi4wMzcxIDYuODQ3NjYgMTYuOTM3NSA3LjM0NzY2IDE3LjcxODggMy45Mjg3NUMxOC41MDAxIDQuNzA5ODggMTkuMDAwMSA1LjYwOTg4IDE5LjMzOCA2LjU4NDM4QzE5LjY3NTkgNy41NTg4OCAxOS44NDc3IDguNTkwMDEgMTkuODQ3NyA5LjY0Njg4QzE5Ljg0NzcgMTAuNzAzNyAxOS42NzU5IDExLjczNDkgMTkuMzM4IDEyLjcxMDlDMTkuMDAwMSAxMy42ODY5IDE4LjUwMDEgMTQuNTg2OSAxNy43MTg4IDE1LjM2ODFDMTYuOTM3NSAxNi4xNDkzIDE2LjAzNzUgMTYuNjQ5MyAxNS4wNjI1IDE2Ljk4NzJDMTQuMDg3OSAxNy4zMjUxIDEzLjA1NjcgMTcuNDk3IDEyIDE3LjQ5N0MxMC45NDMzIDE3LjQ5NyA5LjkxMjExIDE3LjMyNTEgOC45Mzc1IDE2Ljk4NzJDNy45NjI5IDE2LjY0OTMgNy4wNjI5IDE2LjE0OTMgNi4yODEyIDE1LjM2ODFDNS41MDAxIDE0LjU4NjkgNS4wMDAxIDEzLjY4NjkgNC42NjIyIDEyLjcxMDlDNC4zMjQzIDExLjczNDkgNC4xNTI0IDEwLjcwMzcgNC4xNTI0IDkuNjQ2ODhDNC4xNTI0IDguNTkwMDEgNC4zMjQzIDcuNTU4ODggNC42NjIyIDYuNTg0MzhDNS4wMDAxIDUuNjA5ODggNS41MDAxIDQuNzA5ODggNi4yODEyIDMuOTI4NzVDNy4wNjI5IDMuMTQ3NjYgNy45NjI5IDIuNjQ3NjYgOC45Mzc1IDIuMzA5NzdDOS45MTIxMSAxLjk3MTg4IDEwLjk0MzMgMS44MDAwMSAxMiAxLjgwMDAxQzEzLjA1NjcgMS44MDAwMSAxNC4wODc5IDEuOTcxODggMTUuMDYyNSAyLjMwOTc3QzE2LjAzNzEgMi42NDc2NiAxNi45Mzc1IDMuMTQ3NjYgMTcuNzE4OCAzLjkyODc1QzE4LjUwMDEgNC43MDk4OCAxOS4wMDAxIDUuNjA5ODggMTkuMzM4IDYuNTg0MzhDMTkuNjc1OSA3LjU1ODg4IDE5Ljg0NzcgOC41OTAwMSAxOS44NDc3IDkuNjQ2ODhDMTkuODQ3NyAxMC43MDM3IDE5LjY3NTkgMTEuNzM0OSAxOS4zMzggMTIuNzEwOUMxOS4wMDAxIDEzLjY4NjkgMTguNTAwMSAxNC41ODY5IDE3LjcxODggMTUuMzY4MUMxNi45Mzc1IDE2LjE0OTMgMTYuMDM3NSAxNi42NDkzIDE1LjA2MjUgMTYuOTg3MkMxNC4wODc5IDE3LjMyNTEgMTMuMDU2NyAxNy40OTcgMTIgMTcuNDk3QzEwLjk0MzMgMTcuNDk3IDkuOTEyMTEgMTcuMzI1MSA4LjkzNzUgMTYuOTg3MkM3Ljk2MjkgMTYuNjQ5MyA3LjA2MjkgMTYuMTQ5MyA2LjI4MTIgMTUuMzY4MUM1LjUwMDEgMTQuNTg2OSA1LjAwMDEgMTMuNjg2OSA0LjY2MjIgMTIuNzEwOUM0LjMyNDMgMTEuNzM0OSA0LjE1MjQgMTAuNzAzNyA0LjE1MjQgOS42NDY4OEM0LjE1MjQgOC41OTAwMSA0LjMyNDMgNy41NTg4OCA0LjY2MjIgNi41ODQzOEM1LjAwMDEgNS42MDk4OCA1LjUwMDEgNC43MDk4OCA2LjI4MTIgMy45Mjg3NUM3LjA2MjkgMy4xNDc2NiA3Ljk2MjkgMi42NDc2NiA4LjkzNzUgMi4zMDk3N0M5LjkxMjExIDEuOTcxODggMTAuOTQzMyAxLjgwMDAxIDEyIDEuODAwMDFDMTMuMDU2NyAxLjgwMDAxIDE0LjA4NzkgMS45NzE4OCAxNS4wNjI1IDIuMzA5NzdDMTYuMDM3MSAyLjY0NzY2IDE2LjkzNzUgMy4xNDc2NiAxNy43MTg4IDMuOTI4NzVDMTguNTAwMSA0LjcwOTg4IDE5LjAwMDEgNS42MDk4OCAxOS4zMzggNi41ODQzOEMxOS42NzU5IDcuNTU4ODggMTkuODQ3NyA4LjU5MDAxIDE5Ljg0NzcgOS42NDY4OEMxOS44NDc3IDEwLjcwMzcgMTkuNjc1OSAxMS43MzQ5IDE5LjMzOCAxMi43MTA5QzE5LjAwMDEgMTMuNjg2OSAxOC41MDAxIDE0LjU4NjkgMTcuNzE4OCAxNS4zNjgxQzE2LjkzNzUgMTYuMTQ5MyAxNi4wMzc1IDE2LjY0OTMgMTUuMDYyNSAxNi45ODcyQzE0LjA4NzkgMTcuMzI1MSAxMy4wNTY3IDE3LjQ5NyAxMiAxNy40OTdDMTEuMDU2NyAxNy40OTcgMTAuMTI1IDE3LjMyNTEgOS4yMTg3NSAxNi45ODcyQzguMzEyNSAxNi42NDkzIDcuNDUzMTIgMTYuMTQ5MyA2LjY1NjI1IDE1LjM2ODFDNS44NTkzOCAxNC41ODY5IDUuMTQwNjIgMTMuNjg2OSA0LjUxNTYyIDEyLjcxMDlDMy44OTA2MiAxMS43MzQ5IDMuNDUzMTIgMTAuNzAzNyAzLjIwMzEyIDkuNjQ2ODhDMy4wNTMxMiA4LjU5MDAxIDMuMDAwMDEgNy41NTg4OCAzLjA0Njg3IDYuNTg0MzhDMy4wOTM3NSA1LjYwOTg4IDMuMjM0MzcgNC43MDk4OCAzLjQ2ODc1IDMuOTI4NzVDMy43MDMxMiAzLjE0NzY2IDQuMDMxMjUgMi42NDc2NiA0LjQ1MzEyIDIuMzA5NzdDNC44NzUgMS45NzE4OCA1LjM3NSAxLjgwMDAxIDUuOTUzMTIgMS44MDAwMUM2LjUzMTI1IDEuODAwMDEgNy4wNDY4NyAxLjk3MTg4IDcuNTAwMDAgMi4zMDk3N0M3Ljk1MzEyIDIuNjQ3NjYgOC4zNDM3NSAzLjE0NzY2IDguNjcxODcgMy45Mjg3NUM5LjAwMDAwIDQuNzA5ODggOS4xNTYyNSA1LjYwOTg4IDkuMTU2MjUgNi41ODQzOEM5LjE1NjI1IDcuNTU4ODggOS4wMDAwMCA4LjU5MDAxIDguNjcxODcgOS42NDY4OEM4LjM0Mzc1IDEwLjcwMzcgOC4wMDAwMCAxMS43MzQ5IDcuNTAwMDAgMTIuNzEwOUM3LjAwMDAwIDEzLjY4NjkgNi4zNDM3NSAxNC41ODY5IDUuNTMxMjUgMTUuMzY4MUM0LjcxODc1IDE2LjE0OTMgMy43NjU2MiAxNi42NDkzIDIuNjcxODcgMTYuOTg3MkMxLjU3ODEyIDE3LjMyNTEgMC4zNTkzNzUgMTcuNDk3IC0wLjk4NDM3NSAxNy40OTdDLTIuMzI4MTIgMTcuNDk3IC0zLjU5Mzc1IDE3LjMyNTEgLTQuNzc1MDAgMTYuOTg3MkMtNS45NTYyNSAxNi42NDkzIC03LjA0Njg3IDE2LjE0OTMgLTguMDQ2ODcgMTUuMzY4MUMtOS4wNDY4NyAxNC41ODY5IC05Ljk0NTMxIDEzLjY4NjkgLTEwLjc0MjIgMTIuNzEwOUwtMTEuNTM5MSAxMS43MzQ5TC0xMi4yMzQ0IDEwLjcwMzdMLTEyLjgyODEgOS42NDY4OEwtMTMuMzIwMyA4LjU5MDAxTC0xMy43MTA5IDcuNTU4ODhMLTEzLjk5MjIgNi41ODQzOEwtMTQuMTY0MSA1LjYwOTg4TC0xNC4yMjY2IDQuNzA5ODhMLTE0LjE3OTcgMy45Mjg3NUwtMTQuMDIzNCAzLjE0NzY2TC0xMy43NTc4IDIuNjQ3NjZMLTEzLjM5ODQgMi4zMDk3N0wtMTIuOTM1NSAxLjk3MTg4TC0xMi4zNzk3IDEuODAwMDFMLTExLjcyMDMgMS44MDAwMUwtMTAuOTU3OCAxLjk3MTg4TC0xMC4wOTIyIDIuMzA5NzdMLTkuMTI1MDAgMi42NDc2NkwtOC4wNTQ2OSAzLjE0NzY2TC02Ljg4MjgxIDMuOTI4NzVMNS42ODc1IDQuNzA5ODhMNi41MDAwMCA1LjYwOTg4TDcuMjE4NzUgNi41ODQzOEw3LjgzNTk0IDcuNTU4ODhMOC4zNTE1NiA4LjU5MDAxTDguNzY1NjIgOS42NDY4OEw5LjA3ODEyIDEwLjcwMzdMOS4yODkwNiAxMS43MzQ5TDkuMzk4NDQgMTIuNzEwOUw5LjQwNjI1IDEzLjY4NjlMOS4zMTI1IDE0LjU4NjlMOS4xMTcxOSAxNS4zNjgxTDguODIwMzEgMTYuMTQ5M0w4LjQyMTg3IDE2LjY0OTNMNy45MjE4NyAxNy4zMjUxTDcuMzIwMzEgMTcuNDk3TDYuNjE3MTkgMTcuNDk3TDYuNjE3MTkgMTcuNDk3WiIgZmlsbD0iI0UxMzA2QyIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJpbnN0YWdyYW1HcmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMjQiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkY0ODAwIi8+CjxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjRTgzMDBBIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0UxMzA2QyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+',
  tiktok: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5LjU5IDkuODlDMTkuMDkgOS44OSAxOC42NCA5LjY0IDE4LjM0IDkuMjlDMTguMDQgOC45NCAxNy45NCA4LjQ0IDE4LjA5IDguMDFDMTguMjQgNy41OCAxOC42NCA3LjI1IDE5LjA5IDcuMjVDMTkuNTQgNy4yNSAxOS45OSA3LjUgMjAuMjkgNy44NUMyMC41OSA4LjIgMjAuNjkgOC43IDIwLjU0IDkuMTNDMjAuMzkgOS41NiAyMC4wNCA5LjkxIDE5LjU5IDkuODlaTTE5LjU5IDkuODlDMTkuNTkgMTEuMjkgMTkuNTkgMTIuNjkgMTkuNTkgMTQuMDlDMTkuNTkgMTYuMjkgMTcuNzkgMTguMDkgMTUuNTkgMTguMDlDMTMuMzkgMTguMDkgMTEuNTkgMTYuMjkgMTEuNTkgMTQuMDlDMTEuNTkgMTEuODkgMTMuMzkgMTAuMDkgMTUuNTkgMTAuMDlDMTUuNzkgMTAuMDkgMTUuOTkgMTAuMTQgMTYuMTkgMTAuMjRWNS4wOUgxOC4wOUMxOC4wOSA1LjQ5IDE4LjA5IDUuODkgMTguMDkgNi4yOUMxOC4wOSA2LjY5IDE4LjA5IDcuMDkgMTguMDkgNy40OUMxOC40OSA3LjQ5IDE4Ljg5IDcuNDkgMTkuMjkgNy40OUMxOS42OSA3LjQ5IDIwLjA5IDcuNDkgMjAuNDkgNy40OVY5Ljg5QzIwLjA5IDkuODkgMTkuODQgOS44OSAxOS41OSA5Ljg5WiIgZmlsbD0iIzI1RjRFRSIvPgo8L3N2Zz4=',
  reddit: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJDMCAxOC42MjcgNS4zNzMgMjQgMTIgMjRDMTguNjI3IDI0IDI0IDE4LjYyNyAyNCAxMkMyNCA1LjM3MyAxOC42MjcgMCAxMiAwWk0xOC4wMDggNi4wMDhDMTguODA4IDYuMDA4IDE5LjQ0OCA2LjY0OCAxOS40NDggNy40NDhDMTkuNDQ4IDguMjQ4IDE4LjgwOCA4Ljg4OCAxOC4wMDggOC44ODhDMTcuMjA4IDguODg4IDE2LjU2OCA4LjI0OCAxNi41NjggNy40NDhDMTYuNTY4IDYuNjQ4IDE3LjIwOCA2LjAwOCAxOC4wMDggNi4wMDhaTTUuOTkyIDYuMDA4QzYuNzkyIDYuMDA4IDcuNDMyIDYuNjQ4IDcuNDMyIDcuNDQ4QzcuNDMyIDguMjQ4IDYuNzkyIDguODg4IDUuOTkyIDguODg4QzUuMTkyIDguODg4IDQuNTUyIDguMjQ4IDQuNTUyIDcuNDQ4QzQuNTUyIDYuNjQ4IDUuMTkyIDYuMDA4IDUuOTkyIDYuMDA4Wk0xMiAxOC4wMDhDMTEuMjA4IDE4LjAwOCAxMC41NjggMTcuMzY4IDEwLjU2OCAxNi41NjhDMTAuNTY4IDE1Ljc2OCAxMS4yMDggMTUuMTI4IDEyIDE1LjEyOEMxMi43OTIgMTUuMTI4IDEzLjQzMiAxNS43NjggMTMuNDMyIDE2LjU2OEMxMy40MzIgMTcuMzY4IDEyLjc5MiAxOC4wMDggMTIgMTguMDA4Wk0xMiAxMC4wMDhDMTEuMjA4IDEwLjAwOCAxMC41NjggOS4zNjggMTAuNTY4IDguNTY4QzEwLjU2OCA3Ljc2OCAxMS4yMDggNy4xMjggMTIgNy4xMjhDMTIuNzkyIDcuMTI4IDEzLjQzMiA3Ljc2OCAxMy40MzIgOC41NjhDMTMuNDMyIDkuMzY4IDEyLjc5MiAxMC4wMDggMTIgMTAuMDA4WiIgZmlsbD0iI0ZGNDUwMCIvPgo8L3N2Zz4=',
  discord: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjMxNyA0LjM2OTgyQzE4LjM1MiAyLjQwNDgyIDE2LjA4NyAxLjIwNDgyIDEzLjUyMiAwLjcwNDgyM0MxMy4zMjIgMC42NjQ4MjMgMTMuMTIyIDAuNjI0ODIzIDEyLjkyMiAwLjU4NDgyM0MxMi41MjIgMC41MDQ4MjMgMTIuMTIyIDAuNDY0ODIzIDExLjcyMiAwLjQyNDgyM0MxMS4zMjIgMC4zODQ4MjMgMTAuOTIyIDAuMzY0ODIzIDEwLjUyMiAwLjM0NDgyM0M5LjcyMiAwLjMwNDgyMyA4LjkyMiAwLjI4NDgyMyA4LjEyMiAwLjI4NDgyM0M3LjMyMiAwLjI4NDgyMyA2LjUyMiAwLjMwNDgyMyA1LjcyMiAwLjM0NDgyM0M1LjMyMiAwLjM2NDgyMyA0LjkyMiAwLjM4NDgyMyA0LjUyMiAwLjQyNDgyM0M0LjEyMiAwLjQ2NDgyMyAzLjcyMiAwLjUwNDgyMyAzLjMyMiAwLjU4NDgyM0MzLjEyMiAwLjYyNDgyMyAyLjkyMiAwLjY2NDgyMyAyLjcyMiAwLjcwNDgyM0MwLjE2MjAwMyAyLjIwNDgyIC0yLjExNzk3IDQuMzY5ODIgLTQuMDc5OTcgNi4zMzQ4MkMtNC4wNzk5NyA2LjUzNDgyIC00LjA3OTk3IDYuNzM0ODIgLTQuMDM5OTcgNi45MzQ4MkMtNC4wMzk5NyA3LjEzNDgyIC00LjAwMzk3IDcuMzM0ODIgLTMuOTYzOTcgNy41MzQ4MkMtMy45MjM5NyA3LjczNDgyIC0zLjg4Mzk3IDcuOTM0ODIgLTMuODQzOTcgOC4xMzQ4MkMtMy44MDM5NyA4LjMzNDgyIC0zLjc2Mzk3IDguNTM0ODIgLTMuNzIzOTcgOC43MzQ4MkMtMy42ODM5NyA4LjkzNDgyIC0zLjY0Mzk3IDkuMTM0ODIgLTMuNjAzOTcgOS4zMzQ4MkMtMy41NjM5NyA5LjUzNDgyIC0zLjUyMzk3IDkuNzM0ODIgLTMuNDgzOTcgOS45MzQ4MkMtMy40NDM5NyAxMC4xMzUgLTMuNDAzOTcgMTAuMzM1IC0zLjM2Mzk3IDEwLjUzNUMtMy4zMjM5NyAxMC43MzUgLTMuMjgzOTcgMTAuOTM1IC0zLjI0Mzk3IDExLjEzNUMtMy4yMDM5NyAxMS4zMzUgLTMuMTYzOTcgMTEuNTM1IC0zLjEyMzk3IDExLjczNUMtMy4wODM5NyAxMS45MzUgLTMuMDQzOTcgMTIuMTM1IC0zLjAwMzk3IDEyLjMzNUMtMi45NjM5NyAxMi41MzUgLTIuOTIzOTcgMTIuNzM1IC0yLjg4Mzk3IDEyLjkzNUMtMi44NDM5NyAxMy4xMzUgLTIuODAzOTcgMTMuMzM1IC0yLjc2Mzk3IDEzLjUzNUMtMi43MjM5NyAxMy43MzUgLTIuNjgzOTcgMTMuOTM1IC0yLjY0Mzk3IDE0LjEzNUMtMi42MDM5NyAxNC4zMzUgLTIuNTYzOTcgMTQuNTM1IC0yLjUyMzk3IDE0LjczNUMtMi40ODM5NyAxNC45MzUgLTIuNDQzOTcgMTUuMTM1IC0yLjQwMzk3IDE1LjMzNUMtMi4zNjM5NyAxNS41MzUgLTIuMzIzOTcgMTUuNzM1IC0yLjI4Mzk3IDE1LjkzNUMtMi4yNDM5NyAxNi4xMzUgLTIuMjAzOTcgMTYuMzM1IC0yLjE2Mzk3IDE2LjUzNUMtMi4xMjM5NyAxNi43MzUgLTIuMDgzOTcgMTYuOTM1IC0yLjA0Mzk3IDE3LjEzNUMtMi4wMDM5NyAxNy4zMzUgLTEuOTYzOTcgMTcuNTM1IC0xLjkyMzk3IDE3LjczNUMtMS44ODM5NyAxNy45MzUgLTEuODQzOTcgMTguMTM1IC0xLjgwMzk3IDE4LjMzNUMtMS43NjM5NyAxOC41MzUgLTEuNzIzOTcgMTguNzM1IC0xLjY4Mzk3IDE4LjkzNUMtMS42NDM5NyAxOS4xMzUgLTEuNjAzOTcgMTkuMzM1IC0xLjU2Mzk3IDE5LjUzNUMtMS41MjM5NyAxOS43MzUgLTEuNDgzOTcgMTkuOTM1IC0xLjQ0Mzk3IDIwLjEzNUMtMS40MDM5NyAyMC4zMzUgLTEuMzYzOTcgMjAuNTM1IC0xLjMyMzk3IDIwLjczNUMtMS4yODM5NyAyMC45MzUgLTEuMjQzOTcgMjEuMTM1IC0xLjIwMzk3IDIxLjMzNUMtMS4xNjM5NyAyMS41MzUgLTEuMTIzOTcgMjEuNzM1IC0xLjA4Mzk3IDIxLjkzNUMtMS4wNDM5NyAyMi4xMzUgLTEuMDAzOTcgMjIuMzM1IC0wLjk2Mzk3IDIyLjUzNUMtMC45MjM5NyAyMi43MzUgLTAuODgzOTcgMjIuOTM1IC0wLjg0Mzk3IDIzLjEzNUMtMC44MDM5NyAyMy4zMzUgLTAuNzYzOTcgMjMuNTM1IC0wLjcyMzk3IDIzLjczNUMtMC42ODM5NyAyMy45MzUgLTAuNjQzOTcgMjQuMTM1IC0wLjYwMzk3IDI0LjMzNUMtMC41NjM5NyAyNC41MzUgLTAuNTIzOTcgMjQuNzM1IC0wLjQ4Mzk3IDI0LjkzNUMtMC40NDM5NyAyNS4xMzUgLTAuNDAzOTcgMjUuMzM1IC0wLjM2Mzk3IDI1LjUzNUMtMC4zMjM5NyAyNS43MzUgLTAuMjgzOTcgMjUuOTM1IC0wLjI0Mzk3IDI2LjEzNUMtMC4yMDM5NyAyNi4zMzUgLTAuMTYzOTcgMjYuNTM1IC0wLjEyMzk3IDI2LjczNUMtMC4wODM5NyAyNi45MzUgLTAuMDQzOTcgMjcuMTM1IC0wLjAwMzk3IDI3LjMzNUMwLjAzNjAyNyAyNy41MzUgMC4wNzYwMjcgMjcuNzM1IDAuMTE2MDI3IDI3LjkzNUMwLjE1NjAyNyAyOC4xMzUgMC4xOTYwMjcgMjguMzM1IDAuMjM2MDI3IDI4LjUzNUMwLjI3NjAyNyAyOC43MzUgMC4zMTYwMjcgMjguOTM1IDAuMzU2MDI3IDI5LjEzNUMwLjM5NjAyNyAyOS4zMzUgMC40MzYwMjcgMjkuNTM1IDAuNDc2MDI3IDI5LjczNUMwLjUxNjAyNyAyOS45MzUgMC41NTYwMjcgMzAuMTM1IDAuNTk2MDI3IDMwLjMzNUMwLjYzNjAyNyAzMC41MzUgMC42NzYwMjcgMzAuNzM1IDAuNzE2MDI3IDMwLjkzNUMwLjc1NjAyNyAzMS4xMzUgMC43OTYwMjcgMzEuMzM1IDAuODM2MDI3IDMxLjUzNUMwLjg3NjAyNyAzMS43MzUgMC45MTYwMjcgMzEuOTM1IDAuOTU2MDI3IDMyLjEzNUMwLjk5NjAyNyAzMi4zMzUgMS4wMzYwMyAzMi41MzUgMS4wNzYwMyAzMi43MzVRMS4xMTYwMyAzMi45MzUgMS4xNTYwMyAzMy4xMzUgMS4xOTYwMyAzMy4zMzVRMS4yMzYwMyAzMy41MzUgMS4yNzYwMyAzMy43MzUgMS4zMTYwMyAzMy45MzVRMS4zNTYwMyAzNC4xMzUgMS4zOTYwMyAzNC4zMzVRMS40MzYwMyAzNC41MzUgMS40NzYwMyAzNC43MzUgMS41MTYwMyAzNC45MzVRMS41NTYwMyAzNS4xMzUgMS41OTYwMyAzNS4zMzVRMS42MzYwMyAzNS41MzUgMS42NzYwMyAzNS43MzUgMS43MTYwMyAzNS45MzVRMS43NTYwMyAzNi4xMzUgMS43OTYwMyAzNi4zMzVRMS44MzYwMyAzNi41MzUgMS44NzYwMyAzNi43MzUgMS45MTYwMyAzNi45MzVRMS45NTYwMyAzNy4xMzUgMS45OTYwMyAzNy4zMzVRMi4wMzYwMyAzNy41MzUgMi4wNzYwMyAzNy43MzUgMi4xMTYwMyAzNy45MzVRMi4xNTYwMyAzOC4xMzUgMi4xOTYwMyAzOC4zMzVRMi4yMzYwMyAzOC41MzUgMi4yNzYwMyAzOC43MzUgMi4zMTYwMyAzOC45MzVRMi4zNTYwMyAzOS4xMzUgMi4zOTYwMyAzOS4zMzVRMi40MzYwMyAzOS41MzUgMi40NzYwMyAzOS43MzUgMi41MTYwMyAzOS45MzVRMi41NTYwMyA0MC4xMzUgMi41OTYwMyA0MC4zMzVRMi42MzYwMyA0MC41MzUgMi42NzYwMyA0MC43MzUgMi43MTYwMyA0MC45MzVRMi43NTYwMyA0MS4xMzUgMi43OTYwMyA0MS4zMzVRMi44MzYwMyA0MS41MzUgMi44NzYwMyA0MS43MzUgMi45MTYwMyA0MS45MzVRMi45NTYwMyA0Mi4xMzUgMi45OTYwMyA0Mi4zMzVRMy4wMzYwMyA0Mi41MzUgMy4wNzYwMyA0Mi43MzUgMy4xMTYwMyA0Mi45MzVRMy4xNTYwMyA0My4xMzUgMy4xOTYwMyA0My4zMzVRMy4yMzYwMyA0My41MzUgMy4yNzYwMyA0My43MzUgMy4zMTYwMyA0My45MzVRMy4zNTYwMyA0NC4xMzUgMy4zOTYwMyA0NC4zMzVRMy40MzYwMyA0NC41MzUgMy40NzYwMyA0NC43MzUgMy41MTYwMyA0NC45MzVRMy41NTYwMyA0NS4xMzUgMy41OTYwMyA0NS4zMzVRMy42MzYwMyA0NS41MzUgMy42NzYwMyA0NS43MzUgMy43MTYwMyA0NS45MzVRMy43NTYwMyA0Ni4xMzUgMy43OTYwMyA0Ni4zMzVRMy44MzYwMyA0Ni41MzUgMy44NzYwMyA0Ni43MzUgMy45MTYwMyA0Ni45MzVRMy45NTYwMyA0Ny4xMzUgMy45OTYwMyA0Ny4zMzVRNC4wMzYwMyA0Ny41MzUgNC4wNzYwMyA0Ny43MzUgNC4xMTYwMyA0Ny45MzVRNC4xNTYwMyA0OC4xMzUgNC4xOTYwMyA0OC4zMzVRNC4yMzYwMyA0OC41MzUgNC4yNzYwMyA0OC43MzUgNC4zMTYwMyA0OC45MzVRNC4zNTYwMyA0OS4xMzUgNC4zOTYwMyA0OS4zMzVRNC40MzYwMyA0OS41MzUgNC40NzYwMyA0OS43MzUgNC41MTYwMyA0OS45MzVRNC41NTYwMyA1MC4xMzUgNC41OTYwMyA1MC4zMzVRNC42MzYwMyA1MC41MzUgNC42NzYwMyA1MC43MzUgNC43MTYwMyA1MC45MzVRNC43NTYwMyA1MS4xMzUgNC43OTYwMyA1MS4zMzVRNC44MzYwMyA1MS41MzUgNC44NzYwMyA1MS43MzUgNC45MTYwMyA1MS45MzVRNC45NTYwMyA1Mi4xMzUgNC45OTYwMyA1Mi4zMzVRNS4wMzYwMyA1Mi41MzUgNS4wNzYwMyA1Mi43MzUgNS4xMTYwMyA1Mi45MzVRNS4xNTYwMyA1My4xMzUgNS4xOTYwMyA1My4zMzVRNS4yMzYwMyA1My41MzUgNS4yNzYwMyA1My43MzUgNS4zMTYwMyA1My45MzVRNS4zNTYwMyA1NC4xMzUgNS4zOTYwMyA1NC4zMzVRNS40MzYwMyA1NC41MzUgNS40NzYwMyA1NC43MzUgNS41MTYwMyA1NC45MzVRNS41NTYwMyA1NS4xMzUgNS41OTYwMyA1NS4zMzVRNS42MzYwMyA1NS41MzUgNS42NzYwMyA1NS43MzUgNS43MTYwMyA1NS45MzVRNS43NTYwMyA1Ni4xMzUgNS43OTYwMyA1Ni4zMzVRNS44MzYwMyA1Ni41MzUgNS44NzYwMyA1Ni43MzUgNS45MTYwMyA1Ni45MzVRNS45NTYwMyA1Ny4xMzUgNS45OTYwMyA1Ny4zMzVRNi4wMzYwMyA1Ny41MzUgNi4wNzYwMyA1Ny43MzUgNi4xMTYwMyA1Ny45MzVRNi4xNTYwMyA1OC4xMzUgNi4xOTYwMyA1OC4zMzVRNi4yMzYwMyA1OC41MzUgNi4yNzYwMyA1OC43MzUgNi4zMTYwMyA1OC45MzVRNi4zNTYwMyA1OS4xMzUgNi4zOTYwMyA1OS4zMzVRNi40MzYwMyA1OS41MzUgNi40NzYwMyA1OS43MzUgNi41MTYwMyA1OS45MzVRNi41NTYwMyA2MC4xMzUgNi41OTYwMyA2MC4zMzVRNi42MzYwMyA2MC41MzUgNi42NzYwMyA2MC43MzUgNi43MTYwMyA2MC45MzVRNi43NTYwMyA2MS4xMzUgNi43OTYwMyA2MS4zMzVRNi44MzYwMyA2MS41MzUgNi44NzYwMyA2MS43MzUgNi45MTYwMyA2MS45MzVRNi45NTYwMyA2Mi4xMzUgNi45OTYwMyA2Mi4zMzVRNy4wMzYwMyA2Mi41MzUgNy4wNzYwMyA2Mi43MzUgNy4xMTYwMyA2Mi45MzVRNy4xNTYwMyA2My4xMzUgNy4xOTYwMyA2My4zMzVRNy4yMzYwMyA2My41MzUgNy4yNzYwMyA2My43MzUgNy4zMTYwMyA2My45MzVRNy4zNTYwMyA2NC4xMzUgNy4zOTYwMyA2NC4zMzVRNy40MzYwMyA2NC41MzUgNy40NzYwMyA2NC43MzUgNy41MTYwMyA2NC45MzVRNy41NTYwMyA2NS4xMzUgNy41OTYwMyA2NS4zMzVRNy42MzYwMyA2NS41MzUgNy42NzYwMyA2NS43MzUgNy43MTYwMyA2NS45MzVRNy43NTYwMyA2Ni4xMzUgNy43OTYwMyA2Ni4zMzVRNy44MzYwMyA2Ni41MzUgNy44NzYwMyA2Ni43MzUgNy45MTYwMyA2Ni45MzVRNy45NTYwMyA2Ny4xMzUgNy45OTYwMyA2Ny4zMzVRODAuMDM2MDMgNjcuNTM1IDguMDc2MDMgNjcuNzM1IDguMTE2MDMgNjcuOTM1UTguMTU2MDMgNjguMTM1IDguMTk2MDMgNjguMzM1UTguMjM2MDMgNjguNTM1IDguMjc2MDMgNjguNzM1IDguMzE2MDMgNjguOTM1UTguMzU2MDMgNjkuMTM1IDguMzk2MDMgNjkuMzM1UTguNDM2MDMgNjkuNTM1IDguNDc2MDMgNjkuNzM1IDguNTE2MDMgNjkuOTM1UTguNTU2MDMgNzAuMTM1IDguNTk2MDMgNzAuMzM1UTguNjM2MDMgNzAuNTM1IDguNjc2MDMgNzAuNzM1IDguNzE2MDMgNzAuOTM1UTguNzU2MDMgNzEuMTM1IDguNzk2MDMgNzEuMzM1UTguODM2MDMgNzEuNTM1IDguODc2MDMgNzEuNzM1IDguOTE2MDMgNzEuOTM1UTguOTU2MDMgNzIuMTM1IDguOTk2MDMgNzIuMzM1UTkuMDM2MDMgNzIuNTM1IDkuMDc2MDMgNzIuNzM1IDkuMTE2MDMgNzIuOTM1UTkuMTU2MDMgNzMuMTM1IDkuMTk2MDMgNzMuMzM1UTkuMjM2MDMgNzMuNTM1IDkuMjc2MDMgNzMuNzM1IDkuMzE2MDMgNzMuOTM1UTkuMzU2MDMgNzQuMTM1IDkuMzk2MDMgNzQuMzM1UTkuNDM2MDMgNzQuNTM1IDkuNDc2MDMgNzQuNzM1IDkuNTE2MDMgNzQuOTM1UTkuNTU2MDMgNzUuMTM1IDkuNTk2MDMgNzUuMzM1UTkuNjM2MDMgNzUuNTM1IDkuNjc2MDMgNzUuNzM1IDkuNzE2MDMgNzUuOTM1UTkuNzU2MDMgNzYuMTM1IDkuNzk2MDMgNzYuMzM1UTkuODM2MDMgNzYuNTM1IDkuODc2MDMgNzYuNzM1IDkuOTE2MDMgNzYuOTM1UTkuOTU2MDMgNzcuMTM1IDkuOTk2MDMgNzcuMzM1UTkuOTk2MDMgNy41MzQ4MiA5Ljk5NjAzIDcuNzM0ODIgOS45OTYwMyA3LjkzNDgyWiIgZmlsbD0iIzU4NjVGMiIvPgo8L3N2Zz4='
}

export const getSocialPromoEmailHTML = (displayName: string) => {
  const safeName = displayName?.trim() || 'there'
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>MobileGameHunt – Join Our Social Channels</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    
    /* Base Styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #000000 !important;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-wrapper {
      width: 100% !important;
      background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
      background-color: #000000;
      padding: 0;
      margin: 0;
    }
    
    .email-container {
      max-width: 600px !important;
      width: 100% !important;
      margin: 0 auto !important;
      background-color: #0a0a0a;
      border: 2px solid #00ffff;
      border-radius: 0;
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1);
    }
    
    .header-glow {
      background: linear-gradient(180deg, rgba(0, 255, 255, 0.2) 0%, transparent 100%);
      padding: 30px 20px;
      text-align: center;
      border-bottom: 1px solid #00ffff;
    }
    
    .logo-text {
      font-size: 28px !important;
      font-weight: 700 !important;
      color: #00ffff !important;
      text-transform: uppercase !important;
      letter-spacing: 4px !important;
      margin: 0 !important;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5);
    }
    
    .content {
      padding: 40px 30px !important;
      background-color: #0a0a0a;
    }
    
    .greeting {
      font-size: 18px !important;
      color: #00ffff !important;
      margin: 0 0 20px 0 !important;
      font-weight: 600 !important;
    }
    
    .intro-text {
      font-size: 15px !important;
      line-height: 1.7 !important;
      color: #cccccc !important;
      margin: 0 0 20px 0 !important;
    }
    
    .section-title {
      font-size: 14px !important;
      color: #00ffff !important;
      text-transform: uppercase !important;
      letter-spacing: 2px !important;
      margin: 30px 0 20px 0 !important;
      padding-bottom: 10px !important;
      border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
    }
    
    .social-grid {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 20px 0 !important;
    }
    
    .social-row {
      width: 100% !important;
      border-top: 1px solid rgba(0, 255, 255, 0.2) !important;
      padding: 20px 0 !important;
    }
    
    .social-row:first-child {
      border-top: none !important;
    }
    
    .social-icon-cell {
      width: 60px !important;
      padding-right: 15px !important;
      vertical-align: middle !important;
    }
    
    .social-icon-wrapper {
      width: 50px !important;
      height: 50px !important;
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%) !important;
      border: 2px solid #00ffff !important;
      display: inline-block !important;
      text-align: center !important;
      vertical-align: middle !important;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.2) !important;
    }
    
    .social-icon-wrapper img {
      width: 28px !important;
      height: 28px !important;
      display: block !important;
      margin: 11px auto !important;
    }
    
    .social-info-cell {
      vertical-align: middle !important;
      padding-right: 15px !important;
    }
    
    .social-name {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #ffffff !important;
      margin: 0 0 5px 0 !important;
    }
    
    .social-handle {
      font-size: 13px !important;
      color: #888888 !important;
      margin: 0 !important;
    }
    
    .social-button-cell {
      vertical-align: middle !important;
      text-align: right !important;
      width: 100px !important;
    }
    
    .cta-button {
      display: inline-block !important;
      padding: 10px 20px !important;
      background: linear-gradient(135deg, #00ffff 0%, #0099cc 100%) !important;
      color: #000000 !important;
      text-decoration: none !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 1px !important;
      border: 1px solid #00ffff !important;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
    }
    
    .cta-button-ghost {
      background: transparent !important;
      color: #00ffff !important;
      border: 2px solid #00ffff !important;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
    }
    
    .footer-note {
      margin-top: 30px !important;
      padding: 20px !important;
      background-color: rgba(0, 255, 255, 0.05) !important;
      border: 1px dashed rgba(0, 255, 255, 0.4) !important;
      font-size: 13px !important;
      color: #aaaaaa !important;
      line-height: 1.6 !important;
    }
    
    .signature {
      margin-top: 30px !important;
      font-size: 14px !important;
      color: #00ffff !important;
      font-weight: 600 !important;
    }
    
    .footer-text {
      margin-top: 30px !important;
      font-size: 11px !important;
      color: #666666 !important;
      text-align: center !important;
      line-height: 1.6 !important;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-left: none !important;
        border-right: none !important;
      }
      
      .content {
        padding: 30px 20px !important;
      }
      
      .social-row {
        display: block !important;
        padding: 15px 0 !important;
      }
      
      .social-icon-cell,
      .social-info-cell,
      .social-button-cell {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        padding: 5px 0 !important;
      }
      
      .social-button-cell {
        margin-top: 15px !important;
      }
      
      .cta-button {
        width: 100% !important;
        text-align: center !important;
        display: block !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #000000;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600">
            <!-- Header -->
            <tr>
              <td class="header-glow">
                <h1 class="logo-text">Mobile Game Hunt</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td class="content">
                <p class="greeting">Hi ${safeName},</p>
                
                <p class="intro-text">
                  Thank you for being part of the <strong style="color: #00ffff;">MobileGameHunt</strong> community! 
                  We're building something special for mobile game enthusiasts, and we'd love to connect with you 
                  on our social channels.
                </p>
                
                <p class="intro-text">
                  Join us for daily game discoveries, developer spotlights, community highlights, and exclusive 
                  content you won't find anywhere else. Your support helps indie developers reach more players.
                </p>
                
                <!-- Daily Broadcasts Section -->
                <h2 class="section-title">Daily Broadcasts</h2>
                
                <table class="social-grid" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <!-- X (Twitter) -->
                  <tr class="social-row">
                    <td class="social-icon-cell">
                      <div class="social-icon-wrapper">
                        <img src="${SOCIAL_ICONS_BASE64.x}" alt="X logo" width="28" height="28" />
                      </div>
                    </td>
                    <td class="social-info-cell">
                      <p class="social-name">X (Twitter)</p>
                      <p class="social-handle">@mobilegamehunt</p>
                    </td>
                    <td class="social-button-cell">
                      <a href="https://twitter.com/mobilegamehunt" target="_blank" rel="noopener noreferrer" class="cta-button">Follow</a>
                    </td>
                  </tr>
                  
                  <!-- Instagram -->
                  <tr class="social-row">
                    <td class="social-icon-cell">
                      <div class="social-icon-wrapper">
                        <img src="${SOCIAL_ICONS_BASE64.instagram}" alt="Instagram logo" width="28" height="28" />
                      </div>
                    </td>
                    <td class="social-info-cell">
                      <p class="social-name">Instagram</p>
                      <p class="social-handle">@mobilegamehunt</p>
                    </td>
                    <td class="social-button-cell">
                      <a href="https://instagram.com/mobilegamehunt" target="_blank" rel="noopener noreferrer" class="cta-button">Follow</a>
                    </td>
                  </tr>
                  
                  <!-- TikTok -->
                  <tr class="social-row">
                    <td class="social-icon-cell">
                      <div class="social-icon-wrapper">
                        <img src="${SOCIAL_ICONS_BASE64.tiktok}" alt="TikTok logo" width="28" height="28" />
                      </div>
                    </td>
                    <td class="social-info-cell">
                      <p class="social-name">TikTok</p>
                      <p class="social-handle">@mobilegamehunt</p>
                    </td>
                    <td class="social-button-cell">
                      <a href="https://www.tiktok.com/@mobilegamehunt" target="_blank" rel="noopener noreferrer" class="cta-button">Follow</a>
                    </td>
                  </tr>
                </table>
                
                <!-- Community Hangouts Section -->
                <h2 class="section-title">Community Hangouts</h2>
                
                <table class="social-grid" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <!-- Reddit -->
                  <tr class="social-row">
                    <td class="social-icon-cell">
                      <div class="social-icon-wrapper">
                        <img src="${SOCIAL_ICONS_BASE64.reddit}" alt="Reddit logo" width="28" height="28" />
                      </div>
                    </td>
                    <td class="social-info-cell">
                      <p class="social-name">Reddit</p>
                      <p class="social-handle">r/MobileGameHunt</p>
                    </td>
                    <td class="social-button-cell">
                      <a href="https://www.reddit.com/r/MobileGameHunt/" target="_blank" rel="noopener noreferrer" class="cta-button cta-button-ghost">Join</a>
                    </td>
                  </tr>
                  
                  <!-- Discord -->
                  <tr class="social-row">
                    <td class="social-icon-cell">
                      <div class="social-icon-wrapper">
                        <img src="${SOCIAL_ICONS_BASE64.discord}" alt="Discord logo" width="28" height="28" />
                      </div>
                    </td>
                    <td class="social-info-cell">
                      <p class="social-name">Discord</p>
                      <p class="social-handle">Indie dev community</p>
                    </td>
                    <td class="social-button-cell">
                      <a href="https://discord.gg/zahqtja5e9" target="_blank" rel="noopener noreferrer" class="cta-button cta-button-ghost">Join Server</a>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer Note -->
                <div class="footer-note">
                  <p style="margin: 0;">
                    Prefer inbox updates? Just reply to this email anytime and we'll keep you in the loop. 
                    Every follow, like, or share helps indie teams reach more players. Thanks for being here with us.
                  </p>
                </div>
                
                <p class="signature">— The MobileGameHunt Team</p>
                
                <div class="footer-text">
                  You're receiving this email because you joined MobileGameHunt.<br/>
                  Update preferences or unsubscribe anytime.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `
}

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
