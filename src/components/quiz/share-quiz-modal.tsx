'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  Check,
  Twitter,
  MessageSquare,
  Facebook,
  Linkedin,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareQuizModalProps {
  currentUrl: string;
  children: React.ReactNode;
}

export function ShareQuizModal({ currentUrl, children }: ShareQuizModalProps) {
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
    const encodedTitle = encodeURIComponent('Find Your Perfect Mobile Game');
    const encodedText = encodeURIComponent('Take the MobileGameHunt quest to discover games you\'ll love!');

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'reddit':
        return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
      default:
        return '';
    }
  };

  const socialPlatforms = [
    {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/50',
      shareUrl: getSocialShareUrl('twitter')
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600/20 border-blue-600/50 hover:bg-blue-600/30 hover:border-blue-500 hover:shadow-blue-600/50',
      shareUrl: getSocialShareUrl('facebook')
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700/20 border-blue-700/50 hover:bg-blue-700/30 hover:border-blue-600 hover:shadow-blue-700/50',
      shareUrl: getSocialShareUrl('linkedin')
    },
    {
      name: 'Reddit',
      icon: ExternalLink,
      color: 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30 hover:border-orange-400 hover:shadow-orange-500/50',
      shareUrl: getSocialShareUrl('reddit')
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Share Quest
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share this quest with your friends and community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quest Link */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">
              Share Quest Link
            </h3>
            <div className="flex gap-2">
              <Input
                value={currentUrl}
                readOnly
                className="flex-1 bg-gray-900/50 border-purple-500/30 text-sm text-gray-300 focus:border-purple-400"
              />
              <Button
                onClick={handleCopyUrl}
                variant={copied ? "default" : "outline"}
                size="sm"
                className={`min-w-[100px] rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  copied 
                    ? 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30 text-green-400' 
                    : 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/50 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">
              Share on Social Media
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <Button
                  key={platform.name}
                  variant="outline"
                  size="sm"
                  className={`justify-start rounded-xl border-2 ${platform.color} transition-all duration-300 hover:scale-105 text-white backdrop-blur-sm`}
                  onClick={() => handleSocialShare(platform.name, platform.shareUrl)}
                >
                  <platform.icon className="w-4 h-4 mr-2" />
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

