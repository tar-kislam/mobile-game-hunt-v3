'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Globe, Download } from 'lucide-react';

interface PressKit {
  id: string;
  headline: string;
  about: string;
  features: string[];
  media: string[];
  createdAt: string;
  updatedAt: string;
  product: {
    title: string;
    tagline?: string;
    image?: string;
    platforms: string[];
    description: string;
    url: string;
    appStoreUrl?: string;
    playStoreUrl?: string;
    socialLinks?: any;
    releaseAt?: string;
    user: {
      name?: string;
      email?: string;
    };
  };
}

interface PressKitDisplayProps {
  pressKit: PressKit;
  onDownload?: () => void;
}

export function PressKitDisplay({ pressKit, onDownload }: PressKitDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{pressKit.headline}</h1>
        <p className="text-xl text-muted-foreground">{pressKit.product.tagline}</p>
        <div className="flex justify-center gap-2">
          {pressKit.product.platforms.map((platform) => (
            <Badge key={platform} variant="outline">
              {platform}
            </Badge>
          ))}
        </div>
      </div>

      {/* Game Image */}
      {pressKit.product.image && (
        <div className="flex justify-center">
          <img
            src={pressKit.product.image}
            alt={pressKit.product.title}
            className="w-full max-w-md h-64 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{pressKit.about}</p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {pressKit.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Game Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Developer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{pressKit.product.user.name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{pressKit.product.user.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Release Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {pressKit.product.releaseAt
                ? formatDate(pressKit.product.releaseAt)
                : 'TBD'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium mb-2">Website</p>
            <a
              href={pressKit.product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {pressKit.product.url}
            </a>
          </div>

          {pressKit.product.appStoreUrl && (
            <div>
              <p className="font-medium mb-2">App Store</p>
              <a
                href={pressKit.product.appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {pressKit.product.appStoreUrl}
              </a>
            </div>
          )}

          {pressKit.product.playStoreUrl && (
            <div>
              <p className="font-medium mb-2">Google Play</p>
              <a
                href={pressKit.product.playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {pressKit.product.playStoreUrl}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Assets */}
      {pressKit.media.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Media Assets</CardTitle>
            <CardDescription>
              Screenshots, videos, and other media for promotional use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pressKit.media.map((mediaUrl, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={mediaUrl}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Globe className="w-8 h-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Button */}
      {onDownload && (
        <div className="flex justify-center">
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Press Kit
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Press kit last updated: {formatDate(pressKit.updatedAt)}</p>
      </div>
    </div>
  );
}
