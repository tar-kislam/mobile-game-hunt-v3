import * as React from 'react'
import { Column, Img, Row, Section, Text, Button } from '@react-email/components'

export type GameCardProps = {
  index: number
  title: string
  pitch: string
  image: string
  link: string
}

const cardContainerStyle: React.CSSProperties = {
  borderRadius: '16px',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
  marginBottom: '16px',
  backgroundColor: '#ffffff',
}

const thumbnailWrapperStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'center',
}

const thumbnailStyle: React.CSSProperties = {
  borderRadius: '12px',
  width: '150px',
  height: '150px',
  objectFit: 'cover',
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  display: 'inline-block',
}

const contentWrapperStyle: React.CSSProperties = {
  padding: '0 16px 20px 16px',
}

const rankBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 14px',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '14px',
  marginBottom: '12px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#111827',
  margin: '0 0 10px 0',
}

const pitchStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 16px 0',
}

const buttonWrapperStyle: React.CSSProperties = {
  textAlign: 'left',
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #fb923c, #f97316)',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '999px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
}

export function GameCard({ index, title, pitch, image, link }: GameCardProps) {
  return (
    <Section style={cardContainerStyle}>
      <Row>
        <Column style={thumbnailWrapperStyle}>
          <Img
            src={image}
            alt={title}
            width={150}
            height={150}
            style={thumbnailStyle}
          />
        </Column>
        <Column style={{ paddingRight: '16px', paddingLeft: '0' }}>
          <Section style={contentWrapperStyle}>
            <Text style={rankBadgeStyle}>#{index}</Text>
            <Text style={titleStyle}>{title}</Text>
            <Text style={pitchStyle}>{pitch}</Text>
            <div style={buttonWrapperStyle}>
              <Button href={link} style={buttonStyle}>
                Play Now →
              </Button>
            </div>
          </Section>
        </Column>
      </Row>
    </Section>
  )
}


