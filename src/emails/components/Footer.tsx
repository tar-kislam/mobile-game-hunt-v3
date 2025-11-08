import * as React from 'react'
import { Section, Text } from '@react-email/components'

type FooterProps = {
  unsubscribeUrl: string
  baseUrl: string
}

const footerContainerStyle: React.CSSProperties = {
  padding: '24px 16px',
  textAlign: 'center',
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  marginTop: '32px',
}

const footerTextStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.5',
}

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'underline',
}

export function Footer({ unsubscribeUrl, baseUrl }: FooterProps) {
  return (
    <Section style={footerContainerStyle}>
      <Text style={footerTextStyle}>
        Discover more at{' '}
        <a href={baseUrl} style={linkStyle}>
          mobilegamehunt.com
        </a>
      </Text>
      <Text style={footerTextStyle}>
        You received this email because you subscribed to the Mobile Game Hunt newsletter.
      </Text>
      <Text style={footerTextStyle}>
        <a href={unsubscribeUrl} style={linkStyle}>
          Unsubscribe
        </a>
      </Text>
    </Section>
  )
}


