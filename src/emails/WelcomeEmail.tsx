import * as React from 'react'
import { Html, Head, Preview, Body, Container, Section, Img, Text, Button, Hr } from '@react-email/components'

export default function WelcomeEmail() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
  const logoSrc = 'https://mobilegamehunt.com/logo/mgh.png'

  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>Welcome to Mobile Game Hunt! Thanks for joining our community.</Preview>
      <Body style={{ 
        margin: 0, 
        backgroundColor: '#ffffff', 
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#202020',
        lineHeight: '1.6'
      }}>
        <Container style={{ 
          width: '100%', 
          maxWidth: 600, 
          margin: '0 auto', 
          padding: '20px',
          backgroundColor: '#ffffff'
        }}>
          {/* Main Content */}
          <Section style={{ padding: '40px 20px' }}>
            <Text style={{ 
              margin: '0 0 20px 0', 
              fontSize: '24px', 
              fontWeight: 'normal',
              color: '#202020'
            }}>
              Hi there,
            </Text>
            
            <Text style={{ 
              margin: '0 0 16px 0', 
              fontSize: '16px',
              color: '#202020',
              fontWeight: 'bold'
            }}>
              Welcome aboard <span style={{ color: '#ff7a00' }}>M</span>obile <span style={{ color: '#ff7a00' }}>G</span>ame <span style={{ color: '#ff7a00' }}>H</span>unt!
            </Text>
            
            <Text style={{ 
              margin: '0 0 20px 0', 
              fontSize: '16px',
              color: '#202020'
            }}>
              You've joined a community of real players and indie creators who are passionate about discovering and sharing the coolest mobile games.
            </Text>
            
            <Text style={{ 
              margin: '0 0 30px 0', 
              fontSize: '16px',
              color: '#202020'
            }}>
              Whenever you feel like it, jump in to explore new releases, cheer for games that deserve the spotlight or tell the story behind your own project.
            </Text>
            
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <Button
                href={`${baseUrl}`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#1a0f1a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '18px 36px',
                  borderRadius: '999px',
                  fontSize: '16px',
                  fontWeight: 'normal',
                  border: '2px solid transparent',
                  background: 'linear-gradient(135deg, #1a0f1a 0%, #0f0a0f 100%)',
                  backgroundClip: 'padding-box',
                  position: 'relative',
                  boxShadow: '0 0 20px rgba(255, 122, 0, 0.4), 0 0 40px rgba(255, 122, 0, 0.2), inset 0 0 0 2px rgba(255, 122, 0, 0.3)'
                }}
              >
                <span style={{
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  Explore Games →
                </span>
              </Button>
            </div>
            
            <Text style={{ 
              margin: '30px 0 0 0', 
              fontSize: '16px',
              color: '#202020'
            }}>
              Happy hunting,
            </Text>
            
            <Text style={{ 
              margin: '0 0 0 0', 
              fontSize: '16px',
              color: '#202020'
            }}>
              — The Mobile Game Hunt Team 🦊
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={{ 
            border: 'none', 
            height: '1px', 
            backgroundColor: '#e5e5e5',
            margin: '40px 0 20px 0'
          }} />
          
          <Section style={{ 
            padding: '20px 0',
            textAlign: 'center'
          }}>
            <Img 
              src={logoSrc} 
              alt="Mobile Game Hunt" 
              width={32} 
              height={32} 
              style={{ 
                display: 'inline-block',
                marginBottom: '8px'
              }} 
            />
            
            <Text style={{ 
              margin: '0 0 8px 0', 
              fontSize: '12px',
              color: '#999999'
            }}>
              Mobile Game Hunt
            </Text>
            
            <Text style={{ 
              margin: '0 0 15px 0', 
              fontSize: '12px',
              color: '#999999'
            }}>
              Discover amazing mobile games
            </Text>
            
            {/* Social Media Links */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '15px',
              marginTop: '15px'
            }}>
              <a 
                href="https://x.com/mobilegamehunt" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                𝕏
              </a>
              
              <a 
                href="https://discord.gg/mobilegamehunt" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#5865F2',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                💬
              </a>
              
              <a 
                href="https://reddit.com/r/mobilegamehunt" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#FF4500',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                🔗
              </a>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}