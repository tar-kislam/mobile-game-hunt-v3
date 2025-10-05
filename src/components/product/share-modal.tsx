'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Share2, 
  Copy, 
  Check,
  Twitter,
  MessageSquare,
  Music,
  Instagram,
  Globe,
  Youtube,
  ExternalLink,
  Facebook,
  Linkedin
} from 'lucide-react';
import { toast } from 'sonner';

interface SocialLinks {
  website?: string;
  twitter?: string;
  discord?: string;
  tiktok?: string;
  instagram?: string;
  youtube?: string;
}

interface ShareModalProps {
  product: {
    id: string;
    title: string;
    tagline?: string | null;
    socialLinks?: SocialLinks | null;
  };
  currentUrl: string;
  children: React.ReactNode;
}

export function ShareModal({ product, currentUrl, children }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSocialShareUrl = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(product.title);
    const encodedText = encodeURIComponent(product.tagline || product.title);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      case 'discord':
        return `https://discord.com/channels/@me`;
      case 'reddit':
        return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      default:
        return '';
    }
  };

  const socialPlatforms = [
    {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/25',
      shareUrl: getSocialShareUrl('twitter')
    },
    {
      name: 'Discord',
      icon: MessageSquare,
      color: 'hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/25',
      shareUrl: getSocialShareUrl('discord')
    },
    {
      name: 'Reddit',
      icon: ExternalLink,
      color: 'hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/25',
      shareUrl: getSocialShareUrl('reddit')
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/25',
      shareUrl: getSocialShareUrl('facebook')
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-700/25',
      shareUrl: getSocialShareUrl('linkedin')
    }
  ];

  const developerSocialLinks = [
    {
      name: 'Website',
      icon: Globe,
      url: product.socialLinks?.website,
      color: 'hover:bg-gray-500 hover:text-white hover:shadow-lg hover:shadow-gray-500/25'
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      url: product.socialLinks?.twitter,
      color: 'hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/25'
    },
    {
      name: 'Discord',
      icon: MessageSquare,
      url: product.socialLinks?.discord,
      color: 'hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/25'
    },
    {
      name: 'TikTok',
      icon: Music,
      url: product.socialLinks?.tiktok,
      color: 'hover:bg-black hover:text-white hover:shadow-lg hover:shadow-black/25'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: product.socialLinks?.instagram,
      color: 'hover:bg-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/25'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: product.socialLinks?.youtube,
      color: 'hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/25'
    }
  ].filter(link => link.url); // Only show links that exist

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Share {product.title}
          </DialogTitle>
          <DialogDescription>
            Share this game with your friends and community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Share Link */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share Product Link
            </h3>
            <div className="flex gap-2">
              <Input
                value={currentUrl}
                readOnly
                className="flex-1 bg-gray-50 dark:bg-gray-800 text-sm"
              />
              <Button
                onClick={handleCopyUrl}
                variant={copied ? "default" : "outline"}
                size="sm"
                className="min-w-[80px] rounded-full border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share on Social Media
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {socialPlatforms.map((platform) => (
                <Button
                  key={platform.name}
                  variant="outline"
                  size="sm"
                  className={`justify-start rounded-full border-2 ${platform.color} transition-all duration-300 hover:scale-105`}
                  onClick={() => handleSocialShare(platform.name, platform.shareUrl)}
                >
                  <platform.icon className="w-4 h-4 mr-2" />
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Developer Social Links */}
          {developerSocialLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Developer Links
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {developerSocialLinks.map((link) => (
                  <Button
                    key={link.name}
                    variant="outline"
                    size="sm"
                    className={`justify-start rounded-full border-2 ${link.color} transition-all duration-300 hover:scale-105`}
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Responsive Note */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            On mobile, this modal will take full screen for better usability
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
