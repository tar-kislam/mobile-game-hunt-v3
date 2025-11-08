import * as React from 'react'
import { Body, Button, Container, Head, Html, Img, Preview, Section, Text } from '@react-email/components'
import { Footer } from './components/Footer'

export type NewGameEmailProps = {
  title: string
  pitch: string
  image: string
  link: string
  unsubscribeUrl: string
  baseUrl: string
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  backgroundColor: '#0f172a',
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#ffffff',
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '620px',
  margin: '0 auto',
  padding: '32px 16px 48px',
}

const cardStyle: React.CSSProperties = {
  borderRadius: '24px',
  overflow: 'hidden',
  background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(30,41,59,0.95))',
  border: '1px solid rgba(148,163,184,0.2)',
  boxShadow: '0 20px 45px rgba(15,23,42,0.45)',
  marginBottom: '24px',
}

const cardContentStyle: React.CSSProperties = {
  padding: '32px 28px',
  textAlign: 'center' as const,
}

const titleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  margin: '24px 0 16px',
}

const pitchStyle: React.CSSProperties = {
  fontSize: '17px',
  lineHeight: '1.7',
  color: 'rgba(226,232,240,0.85)',
  margin: '0 0 28px 0',
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '16px 32px',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, #fb7185, #f97316)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'none',
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 18px',
  borderRadius: '999px',
  backgroundColor: 'rgba(59,130,246,0.16)',
  color: '#60a5fa',
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '1.4px',
}

export default function NewGameEmail({ title, pitch, image, link, unsubscribeUrl, baseUrl }: NewGameEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>🚀 New Game Added: {title}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={cardStyle}>
            <div style={{ textAlign: 'center', paddingTop: '28px' }}>
              <span style={badgeStyle}>Just Launched</span>
            </div>
            <Img
              src={image}
              alt={title}
              width={600}
              height={320}
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
              }}
            />
            <Section style={cardContentStyle}>
              <Text style={titleStyle}>{title}</Text>
              <Text style={pitchStyle}>{pitch}</Text>
              <Button href={link} style={buttonStyle}>
                Check it out →
              </Button>
            </Section>
          </Section>
          <Footer unsubscribeUrl={unsubscribeUrl} baseUrl={baseUrl} />
        </Container>
      </Body>
    </Html>
  )
}


