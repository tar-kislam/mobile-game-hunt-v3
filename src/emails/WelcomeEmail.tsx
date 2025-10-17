import * as React from 'react'
import { Html, Head, Preview, Body, Container, Section, Img, Text, Button, Hr } from '@react-email/components'

const brandBg = '#0e0e12'
const brandAccent = '#6c63ff'
const fontFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif"

export default function WelcomeEmail() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
  const logoSrc = `${baseUrl}/logo/mgh.png`

  return (
    <Html>
      <Head />
      <Preview>Welcome to Mobile Game Hunt! Explore the best new mobile games every week.</Preview>
      <Body style={{ margin: 0, backgroundColor: brandBg, fontFamily, color: '#ffffff' }}>
        <Container style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
          {/* Header */}
          <Section style={{ textAlign: 'center', padding: '32px 0 16px' }}>
            <Img src={logoSrc} alt="Mobile Game Hunt" width={96} height={96} style={{ display: 'inline-block', borderRadius: 20 }} />
            <div style={{ height: 16 }} />
            <Hr style={{ border: 'none', height: 1, background: 'linear-gradient(90deg, rgba(108,99,255,0) 0%, rgba(108,99,255,0.6) 50%, rgba(108,99,255,0) 100%)' }} />
          </Section>

          {/* Main */}
          <Section style={{ padding: '24px 0 8px', textAlign: 'center' }}>
            <Text style={{ margin: 0, fontSize: 28, lineHeight: '34px', fontWeight: 700, color: '#ffffff' }}>
              Welcome to{' '}
              <span style={{ color: '#ff7a00', textShadow: '0 0 12px rgba(255,122,0,0.6), 0 0 24px rgba(255,122,0,0.35)' }}>M</span>
              obile{' '}
              <span style={{ color: '#ff7a00', textShadow: '0 0 12px rgba(255,122,0,0.6), 0 0 24px rgba(255,122,0,0.35)' }}>G</span>
              ame{' '}
              <span style={{ color: '#ff7a00', textShadow: '0 0 12px rgba(255,122,0,0.6), 0 0 24px rgba(255,122,0,0.35)' }}>H</span>
              unt!
            </Text>
            <div style={{ height: 12 }} />
            <Text style={{ margin: 0, fontSize: 15, lineHeight: '24px', color: '#b0b0b0' }}>
              You’ve just joined a growing community of mobile gamers, indie developers, and enthusiasts discovering the best new games every week.
            </Text>
            <div style={{ height: 24 }} />
            <Button
              href={baseUrl}
              style={{
                display: 'inline-block',
                color: '#ffffff',
                textDecoration: 'none',
                padding: 0,
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: 18,
                background: 'linear-gradient(90deg, #0f1220 0%, #181221 60%, #1e1421 100%)',
                boxShadow:
                  '0 2px 0 rgba(0,0,0,0.6) inset, 0 10px 28px rgba(108,99,255,0.45), 0 0 0 1px rgba(108,99,255,0.45)',
                border: '1px solid rgba(108,99,255,0.35)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '16px 28px',
                  borderRadius: 9999,
                }}
              >
                Explore Games
              </span>
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '28px 0 36px', textAlign: 'center' }}>
            <Text style={{ margin: 0, fontSize: 14, lineHeight: '22px', color: '#a3a3a3' }}>
              Stay tuned, your next favorite mobile game is just one click away.
            </Text>
            <div style={{ height: 16 }} />
            {/* Social icons (simple text links for compatibility) */}
            <Text style={{ margin: 0, fontSize: 13, color: '#8a8a8a' }}>
              <a href="https://twitter.com/mobilegamehunt" style={{ color: brandAccent, textDecoration: 'none' }}>X</a>
              {' '}·{' '}
              <a href="https://discord.gg/mobilegamehunt" style={{ color: brandAccent, textDecoration: 'none' }}>Discord</a>
              {' '}·{' '}
              <a href="https://www.reddit.com/r/MobileGameHunt/" style={{ color: brandAccent, textDecoration: 'none' }}>Reddit</a>
            </Text>
            <div style={{ height: 10 }} />
            <Text style={{ margin: 0, fontSize: 12, color: '#777' }}>© MobileGameHunt 2025</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}


