'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Key } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PlaytestManager } from '@/components/playtest/playtest-manager';

interface Product {
  id: string;
  title: string;
  tagline?: string;
  image?: string;
  status: string;
  pressKit?: {
    id: string;
    headline: string;
    updatedAt: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchUserProducts();
    }
  }, [status, router]);

  const fetchUserProducts = async () => {
    try {
      const response = await fetch(`/api/products?userId=${session?.user?.id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load your games');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your games and press kits
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    {product.tagline && (
                      <CardDescription className="mt-1">
                        {product.tagline}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={product.status === 'PUBLISHED' ? 'default' : 'secondary'}
                  >
                    {product.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.pressKit ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText className="w-4 h-4" />
                      <span>Press Kit: {product.pressKit.headline}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>No Press Kit</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      View Game
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/presskit/${product.id}`)}
                    >
                      {product.pressKit ? 'Edit Press Kit' : 'Create Press Kit'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Playtest Management Section */}
          {products.length > 0 && (
            <div className="col-span-full">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Key className="w-6 h-6" />
                Playtest Management
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <PlaytestManager
                    key={`playtest-${product.id}`}
                    gameId={product.id}
                    gameTitle={product.title}
                  />
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No games yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first game to start building press kits
                </p>
                <Button asChild>
                  <Link href="/submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your Game
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
