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

const SOCIAL_ICON_URLS = {
  x: 'https://cdn.simpleicons.org/x/0EA5E9',
  instagram: 'https://cdn.simpleicons.org/instagram/E1306C',
  tiktok: 'https://cdn.simpleicons.org/tiktok/25F4EE',
  reddit: 'https://cdn.simpleicons.org/reddit/FF4500',
  discord: 'https://cdn.simpleicons.org/discord/5865F2',
}


export const getSocialPromoEmailHTML = (displayName: string) => {
  const safeName = displayName?.trim() || 'there'
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MobileGameHunt – Connect with us</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #01030a;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: #eef4ff;
    }
    .wrapper {
      width: 100%;
      background: radial-gradient(circle at 20% 20%, #0b1a2b, #01030a 70%);
      padding: 32px 0;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      background: rgba(2, 10, 22, 0.95);
      border-radius: 24px;
      border: 1px solid rgba(58, 207, 255, 0.3);
      padding: 40px 44px;
      box-shadow: 0 25px 60px rgba(0, 202, 255, 0.18), inset 0 0 45px rgba(0, 255, 255, 0.04);
      position: relative;
      overflow: hidden;
    }
    .container::before {
      content: '';
      position: absolute;
      inset: 18px;
      border-radius: 20px;
      border: 1px solid rgba(147, 197, 253, 0.08);
      pointer-events: none;
    }
    .pill {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(14, 165, 233, 0.15);
      color: #7dd3fc;
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 26px;
      color: #fefefe;
      text-shadow: 0 0 12px rgba(14, 165, 233, 0.25);
    }
    p {
      margin: 0 0 16px;
      line-height: 1.7;
      color: #c5d8ff;
      font-size: 15px;
    }
    .grid {
      margin-top: 32px;
      border-radius: 20px;
      border: 1px solid rgba(14, 165, 233, 0.25);
      background: rgba(4, 13, 27, 0.75);
      overflow: hidden;
    }
    .section {
      padding: 28px 24px 10px;
      position: relative;
    }
    .section + .section {
      border-top: 1px solid rgba(59, 130, 246, 0.15);
    }
    .section h2 {
      font-size: 15px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      margin: 0 0 18px;
      color: #5ee7ff;
    }
    .social-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 0;
      border-top: 1px solid rgba(148, 163, 184, 0.15);
    }
    .social-row:first-of-type {
      border-top: none;
    }
    .social-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: linear-gradient(145deg, rgba(15, 118, 255, 0.25), rgba(0, 0, 0, 0.4));
      border: 1px solid rgba(14, 165, 233, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 12px rgba(59, 130, 246, 0.35);
    }
    .social-icon img {
      width: 26px;
      height: 26px;
      display: block;
    }
    .social-meta {
      flex: 1;
    }
    .social-meta strong {
      display: block;
      font-size: 15px;
      color: #f8fbff;
    }
    .social-meta span {
      display: block;
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .cta {
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      color: #010308;
      background: linear-gradient(120deg, #22d3ee, #3b82f6);
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.35);
      white-space: nowrap;
    }
    .cta--ghost {
      background: transparent;
      border: 1px solid rgba(125, 211, 252, 0.8);
      color: #7dd3fc;
    }
    .note {
      margin-top: 28px;
      padding: 18px 20px;
      border-radius: 16px;
      border: 1px dashed rgba(148, 163, 184, 0.6);
      color: #9fb5d3;
      font-size: 13px;
      background: rgba(4, 13, 27, 0.7);
    }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #7c8aaa;
      text-align: center;
      line-height: 1.6;
    }
    @media (max-width: 640px) {
      .container {
        padding: 32px 24px;
      }
      .social-row {
        flex-direction: column;
        align-items: flex-start;
      }
      .cta {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <span class="pill">Stay tuned</span>
      <h1>Let's meet on your favorite channels</h1>
      <p>Hi ${safeName},</p>
      <p>
        Thank you for being part of the MobileGameHunt community and supporting mobile games.
        We’ve started sharing more frequent updates, early finds, and community highlights there and we’d love to have you join us.
        Your support genuinely boosts the visibility of indie games across the entire community.
      </p>
      <div class="grid">
        <div class="section">
          <h2>Daily Broadcasts</h2>
          <div class="social-row">
            <div class="social-icon">
              <img src="${SOCIAL_ICON_URLS.x}" alt="X logo" />
            </div>
            <div class="social-meta">
              <strong>X (Twitter)</strong>
              <span>@mobilegamehunt</span>
            </div>
            <a class="cta" href="https://twitter.com/mobilegamehunt" target="_blank" rel="noopener noreferrer">Follow</a>
          </div>
          <div class="social-row">
            <div class="social-icon">
              <img src="${SOCIAL_ICON_URLS.instagram}" alt="Instagram logo" />
            </div>
            <div class="social-meta">
              <strong>Instagram</strong>
              <span>@mobilegamehunt</span>
            </div>
            <a class="cta" href="https://instagram.com/mobilegamehunt" target="_blank" rel="noopener noreferrer">Follow</a>
          </div>
          <div class="social-row">
            <div class="social-icon">
              <img src="${SOCIAL_ICON_URLS.tiktok}" alt="TikTok logo" />
            </div>
            <div class="social-meta">
              <strong>TikTok</strong>
              <span>@mobilegamehunt</span>
            </div>
            <a class="cta" href="https://www.tiktok.com/@mobilegamehunt" target="_blank" rel="noopener noreferrer">Follow</a>
          </div>
        </div>
        <div class="section">
          <h2>Community Hangouts</h2>
          <div class="social-row">
            <div class="social-icon">
              <img src="${SOCIAL_ICON_URLS.reddit}" alt="Reddit logo" />
            </div>
            <div class="social-meta">
              <strong>Reddit</strong>
              <span>r/MobileGameHunt</span>
            </div>
            <a class="cta cta--ghost" href="https://www.reddit.com/r/MobileGameHunt/" target="_blank" rel="noopener noreferrer">Join</a>
          </div>
          <div class="social-row">
            <div class="social-icon">
              <img src="${SOCIAL_ICON_URLS.discord}" alt="Discord logo" />
            </div>
            <div class="social-meta">
              <strong>Discord</strong>
              <span>Indie dev community</span>
            </div>
            <a class="cta cta--ghost" href="https://discord.gg/zahqtja5e9" target="_blank" rel="noopener noreferrer">Join server</a>
          </div>
        </div>
      </div>
      <div class="note">
        Prefer inbox updates? Just reply to this email anytime and we’ll keep you in the loop.
        Every follow, like, or share helps indie teams reach more players. Thanks for being here with us.
      </div>
      <p style="margin-top: 24px;">— The MobileGameHunt Team</p>
      <div class="footer">
        You're receiving this email because you joined MobileGameHunt.<br/>
        Update preferences or unsubscribe anytime.
      </div>
    </div>
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
