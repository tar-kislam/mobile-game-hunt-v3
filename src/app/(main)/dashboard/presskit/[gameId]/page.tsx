'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PressKit {
  id: string;
  gameId: string;
  headline: string;
  about: string;
  features: string[];
  media: string[];
}

interface Product {
  id: string;
  title: string;
  tagline?: string;
  image?: string;
  platforms: string[];
}

export default function PressKitFormPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [pressKit, setPressKit] = useState<PressKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    headline: '',
    about: '',
    features: [''],
    media: [''],
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchGameAndPressKit();
  }, [session, router, gameId]);

  const fetchGameAndPressKit = async () => {
    try {
      // Fetch product details
      const productResponse = await fetch(`/api/products/${gameId}`);
      if (!productResponse.ok) {
        throw new Error('Failed to fetch game');
      }
      const productData = await productResponse.json();
      
      if (!productData || !productData.title) {
        throw new Error('Invalid game data received');
      }
      
      setProduct(productData);

      // Try to fetch existing press kit
      const pressKitResponse = await fetch(`/api/presskit?gameId=${gameId}`);
      if (pressKitResponse.ok) {
        const pressKitData = await pressKitResponse.json();
        if (pressKitData.pressKit) {
          setPressKit(pressKitData.pressKit);
          setFormData({
            headline: pressKitData.pressKit.headline,
            about: pressKitData.pressKit.about,
            features: pressKitData.pressKit.features.length > 0 ? pressKitData.pressKit.features : [''],
            media: pressKitData.pressKit.media.length > 0 ? pressKitData.pressKit.media : [''],
          });
        } else {
          // No press kit data in response, use defaults
          setFormData({
            headline: productData.title,
            about: productData.description || '',
            features: [''],
            media: [''],
          });
        }
      } else {
        // No existing press kit, use defaults
        setFormData({
          headline: productData.title,
          about: productData.description || '',
          features: [''],
          media: [''],
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load game data');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ''],
    });
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({ ...formData, features: newFeatures });
    }
  };

  const handleMediaChange = (index: number, value: string) => {
    const newMedia = [...formData.media];
    newMedia[index] = value;
    setFormData({ ...formData, media: newMedia });
  };

  const addMedia = () => {
    setFormData({
      ...formData,
      media: [...formData.media, ''],
    });
  };

  const removeMedia = (index: number) => {
    if (formData.media.length > 1) {
      const newMedia = formData.media.filter((_, i) => i !== index);
      setFormData({ ...formData, media: newMedia });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean up empty features and media
      const cleanFeatures = formData.features.filter(f => f.trim() !== '');
      const cleanMedia = formData.media.filter(m => m.trim() !== '');

      const response = await fetch('/api/presskit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          headline: formData.headline,
          about: formData.about,
          features: cleanFeatures.length > 0 ? cleanFeatures : [''],
          media: cleanMedia,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save press kit');
      }

      const data = await response.json();
      toast.success(data.message);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving press kit:', error);
      toast.error('Failed to save press kit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start gap-4 mb-6">
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              {product.tagline && (
                <p className="text-muted-foreground mt-1">{product.tagline}</p>
              )}
              <div className="flex gap-2 mt-2">
                {product.platforms.map((platform) => (
                  <Badge key={platform} variant="outline">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {pressKit ? 'Edit Press Kit' : 'Create Press Kit'}
            </CardTitle>
            <CardDescription>
              Create a professional press kit for your game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Enter a compelling headline for your game"
                  required
                />
              </div>

              <div>
                <Label htmlFor="about">About *</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Describe your game, its story, and what makes it unique"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Key Features *</Label>
                <div className="space-y-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        required={index === 0}
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              <div>
                <Label>Media Assets</Label>
                <div className="space-y-2 mt-2">
                  {formData.media.map((mediaUrl, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={mediaUrl}
                        onChange={(e) => handleMediaChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        type="url"
                      />
                      {formData.media.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeMedia(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMedia}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Media URL
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Add URLs to screenshots, videos, logos, or other media assets
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Press Kit'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
