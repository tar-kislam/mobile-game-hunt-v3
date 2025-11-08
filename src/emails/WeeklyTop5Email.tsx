import * as React from 'react'
import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'
import { GameCard } from './components/GameCard'
import { Footer } from './components/Footer'

export type WeeklyTop5EmailProps = {
  games: Array<{
    title: string
    pitch: string
    image: string
    link: string
  }>
  unsubscribeUrl: string
  baseUrl: string
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  backgroundColor: '#f3f4f6',
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#111827',
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '640px',
  margin: '0 auto',
  padding: '24px 16px 48px',
}

const headerSectionStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 24px',
  background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
  borderRadius: '24px',
  color: '#ffffff',
  marginBottom: '24px',
}

const headerTitleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  margin: '0 0 12px 0',
}

const headerSubtitleStyle: React.CSSProperties = {
  fontSize: '16px',
  margin: 0,
  color: 'rgba(255,255,255,0.85)',
}

export default function WeeklyTop5Email({ games, unsubscribeUrl, baseUrl }: WeeklyTop5EmailProps) {
  return (
    <Html>
      <Head />
      <Preview>🔥 This Week’s Top 5 Mobile Games</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerSectionStyle}>
            <Text style={headerTitleStyle}>🔥 This Week’s Top 5 Mobile Games</Text>
            <Text style={headerSubtitleStyle}>
              Hand-picked by the Mobile Game Hunt community. Here’s what you should play next!
            </Text>
          </Section>

          {games.map((game, index) => (
            <GameCard
              key={game.link}
              index={index + 1}
              title={game.title}
              pitch={game.pitch}
              image={game.image}
              link={game.link}
            />
          ))}

          <Footer unsubscribeUrl={unsubscribeUrl} baseUrl={baseUrl} />
        </Container>
      </Body>
    </Html>
  )
}


