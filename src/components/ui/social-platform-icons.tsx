/**
 * Social platform icons component
 * Uses react-icons for consistent, crisp vector icons
 */

import { 
  FaTiktok,
  FaXTwitter,
  FaInstagram,
  FaFacebook,
  FaDiscord,
  FaReddit,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
  FaApple,
  FaGooglePlay,
} from 'react-icons/fa6'

interface SocialPlatformIconProps {
  platform: string
  size?: number
  className?: string
}

export function SocialPlatformIcon({ platform, size = 28, className = '' }: SocialPlatformIconProps) {
  const iconProps = {
    size,
    className: className || 'text-gray-300',
  }

  switch (platform.toLowerCase()) {
    case 'tiktok':
      return <FaTiktok {...iconProps} />
    case 'x':
    case 'twitter':
      return <FaXTwitter {...iconProps} />
    case 'instagram':
      return <FaInstagram {...iconProps} />
    case 'facebook':
      return <FaFacebook {...iconProps} />
    case 'discord':
      return <FaDiscord {...iconProps} />
    case 'reddit':
      return <FaReddit {...iconProps} />
    case 'linkedin':
      return <FaLinkedin {...iconProps} />
    case 'youtube':
      return <FaYoutube {...iconProps} />
    case 'website':
    case 'web':
      return <FaGlobe {...iconProps} />
    case 'ios':
    case 'appstore':
      return <FaApple {...iconProps} />
    case 'android':
    case 'playstore':
      return <FaGooglePlay {...iconProps} />
    default:
      return null
  }
}

