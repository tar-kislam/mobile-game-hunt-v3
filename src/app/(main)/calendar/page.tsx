'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Globe, Smartphone, CalendarDays, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface CalendarProduct {
  id: string;
  title: string;
  description: string;
  image: string | null;
  url: string;
  platforms: string[];
  countries: string[];
  status: string;
  releaseAt: string;
  user: {
    name: string | null;
  };
}

export default function CalendarPage() {
  const [products, setProducts] = useState<CalendarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    platform: 'all',
    country: 'all',
    year: new Date().getFullYear().toString()
  });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  const platforms = ['ios', 'android', 'web', 'windows', 'mac'];
  const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'KR', 'CN', 'IN'];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.platform && filters.platform !== 'all') params.append('platform', filters.platform);
      if (filters.country && filters.country !== 'all') params.append('country', filters.country);
      if (filters.year) params.append('year', filters.year);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      // Filter products with release dates
      const productsWithRelease = data.filter((product: any) => product.releaseAt);
      setProducts(productsWithRelease);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadICS = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.platform && filters.platform !== 'all') params.append('platform', filters.platform);
      if (filters.country && filters.country !== 'all') params.append('country', filters.country);
      if (filters.year) params.append('year', filters.year);
      
      const response = await fetch(`/api/calendar/ics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to download calendar');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mobile-game-hunt-calendar-${filters.year}.ics`;
      document.body.appendChild(a);
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download calendar');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilRelease = (dateString: string) => {
    const now = new Date();
    const releaseDate = new Date(dateString);
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Released';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getStatusColor = (dateString: string) => {
    const now = new Date();
    const releaseDate = new Date(dateString);
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (diffDays <= 7) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (diffDays <= 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📅 Release Calendar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track upcoming mobile game and app releases globally
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform
                </label>
                <Select value={filters.platform} onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    {platforms.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All countries</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <Select value={filters.year} onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Button */}
        <div className="text-center mb-8">
          <Button 
            onClick={downloadICS}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Calendar (ICS)
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Import to Google Calendar, Apple Calendar, Outlook, or any calendar app
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Calendar Events */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No releases found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or check back later for new releases.
                </p>
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {product.title}
                        </h3>
                        <Badge className={getStatusColor(product.releaseAt)}>
                          {getTimeUntilRelease(product.releaseAt)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {product.description}
                      </p>

                      {/* Release Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{formatDate(product.releaseAt)}</span>
                      </div>

                      {/* Platforms & Countries */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.platforms?.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            <Smartphone className="w-3 h-3 mr-1" />
                            {platform.toUpperCase()}
                          </Badge>
                        ))}
                        {product.countries?.map((country) => (
                          <Badge key={country} variant="outline" className="text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            {country}
                          </Badge>
                        ))}
                      </div>

                      {/* User Info */}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        by <span className="font-medium text-gray-700 dark:text-gray-300">
                          {product.user.name || 'Anonymous'}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                          View Details
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        {products.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {products.length} releases with dates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
