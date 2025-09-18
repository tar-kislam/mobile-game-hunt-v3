'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Download, Filter, Globe, Smartphone, CalendarDays, MapPin, ChevronLeft, ChevronRight, Eye, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';

interface CalendarProduct {
  id: string;
  title: string;
  tagline?: string | null;
  description: string;
  thumbnail: string | null;
  url: string;
  platforms: string[];
  countries: string[];
  status: string;
  releaseAt: string;
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  user: {
    name: string | null;
  };
}

interface CalendarDay {
  date: Date;
  products: CalendarProduct[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<CalendarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(
    (searchParams.get('view') as 'calendar' | 'list') || 'calendar'
  );
  const [filters, setFilters] = useState({
    platform: 'all',
    country: 'all',
    category: 'all',
    year: searchParams.get('year') || new Date().getFullYear().toString()
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    platforms: [] as string[],
    countries: [] as string[],
    categories: [] as Array<{ id: string; name: string }>,
    years: [] as number[]
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayReleases, setSelectedDayReleases] = useState<CalendarProduct[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/calendar/filters');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filter options: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Set fallback options to prevent the page from breaking
      setFilterOptions({
        platforms: ['IOS', 'ANDROID', 'WEB', 'WINDOWS', 'MAC'],
        countries: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'KR', 'CN', 'IN'],
        categories: [],
        years: [new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2]
      });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.platform && filters.platform !== 'all') params.append('platform', filters.platform);
      if (filters.country && filters.country !== 'all') params.append('country', filters.country);
      if (filters.category && filters.category !== 'all') params.append('categoryId', filters.category);
      if (filters.year) params.append('year', filters.year);
      
      const response = await fetch(`/api/calendar?${params.toString()}`);
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
      if (filters.category && filters.category !== 'all') params.append('categoryId', filters.category);
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

  // Calendar grid generation
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayProducts = products.filter(product => {
        const releaseDate = new Date(product.releaseAt);
        return releaseDate.getDate() === date.getDate() &&
               releaseDate.getMonth() === date.getMonth() &&
               releaseDate.getFullYear() === date.getFullYear();
      });
      
      days.push({
        date,
        products: dayProducts,
        isToday: date.toDateString() === today.toDateString(),
        isCurrentMonth: date.getMonth() === month
      });
    }
    
    return days;
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToUpcoming = () => {
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 7);
    setCurrentDate(upcoming);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = async (date: Date) => {
    setSelectedDay(date);
    setLoadingReleases(true);
    
    try {
      const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const response = await fetch(`/api/releases?date=${dateString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      
      const data = await response.json();
      setSelectedDayReleases(data.releases || []);
    } catch (err) {
      console.error('Error fetching releases:', err);
      setSelectedDayReleases([]);
    } finally {
      setLoadingReleases(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previousMonth();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextMonth();
    }
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]">
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
    <div 
      className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] bg-[radial-gradient(80%_80%_at_0%_0%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(80%_80%_at_100%_100%,rgba(6,182,212,0.18),transparent_60%)]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="container mx-auto px-4 py-8">

        {/* Filters */}
        {/* Mobile Filters - Accordion */}
        <div className="block md:hidden mb-6">
          <Collapsible open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
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
                          {filterOptions.platforms.map(platform => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
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
                          {filterOptions.countries.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          {filterOptions.categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                          {filterOptions.years.map(year => (
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
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop Filters */}
        <Card className="hidden md:block mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {filterOptions.platforms.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
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
                    {filterOptions.countries.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {filterOptions.categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                    {filterOptions.years.map(year => (
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

        {/* Quick Actions */}
        {/* Mobile Actions - Pill-shaped buttons */}
        <div className="block md:hidden mb-8">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              onClick={goToToday}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-xs"
            >
              Today
            </Button>
            <Button 
              onClick={goToUpcoming}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-xs"
            >
              Upcoming
            </Button>
            <Button 
              onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-xs"
            >
              {viewMode === 'calendar' ? 'List' : 'Calendar'}
            </Button>
            <Button 
              onClick={downloadICS}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex flex-wrap gap-4 mb-8 justify-center">
          <Button 
            onClick={goToToday}
            variant="outline"
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </Button>
          <Button 
            onClick={goToUpcoming}
            variant="outline"
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Upcoming (7 days)
          </Button>
          <Button 
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            variant="outline"
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
          </Button>
          <Button 
            onClick={downloadICS}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Calendar (ICS)
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{monthName}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Click on any day to see game releases • Use ← → arrow keys to navigate months
              </p>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day.date)}
                    className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors ${
                      day.isToday 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                        : day.isCurrentMonth 
                          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' 
                          : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                      day.isToday 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : day.isCurrentMonth 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      <span>{day.date.getDate()}</span>
                      {day.products.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-purple-500 font-medium">
                            {day.products.length}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Products for this day */}
                    <div className="space-y-1">
                      {day.products.slice(0, 2).map((product) => (
                        <TooltipProvider key={product.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/product/${product.id}`}>
                                <div className="flex items-center gap-1 p-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                  {product.thumbnail ? (
                                    <img
                                      src={product.thumbnail}
                                      alt={product.title}
                                      className="w-4 h-4 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                                      <span className="text-xs">🎮</span>
                                    </div>
                                  )}
                                  <span className="text-xs truncate">{product.title}</span>
                                </div>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-xs">
                                <div className="font-medium">{product.title}</div>
                                {product.tagline && <div className="text-sm text-gray-600 dark:text-gray-400">{product.tagline}</div>}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Platforms: {product.platforms.join(', ')}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {day.products.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{day.products.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Day Releases */}
        {selectedDay && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Game Releases - {selectedDay.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReleases ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDayReleases.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No releases on this day
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later or explore other dates for upcoming game releases.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayReleases.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start space-x-3 md:space-x-4">
                          {/* Product Image - Clickable on mobile */}
                          <div className="flex-shrink-0">
                            <Link href={`/product/${product.id}`} className="block">
                              {product.thumbnail ? (
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              ) : (
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                                  <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">No Image</span>
                                </div>
                              )}
                            </Link>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Link href={`/product/${product.id}`} className="flex-1 min-w-0">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                  {product.title}
                                </h3>
                              </Link>
                              <Badge className={`${getStatusColor(product.releaseAt)} text-xs`}>
                                {getTimeUntilRelease(product.releaseAt)}
                              </Badge>
                            </div>
                            
                            {product.tagline && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                                {product.tagline}
                              </p>
                            )}
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 hidden md:block">
                              {product.description.length > 150 ? `${product.description.substring(0, 150)}...` : product.description}
                            </p>

                            {/* Release Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="font-medium text-xs md:text-sm">{formatDate(product.releaseAt)}</span>
                            </div>

                            {/* Platforms & Countries - Smaller on mobile */}
                            <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                              {product.platforms?.slice(0, 3).map((platform) => (
                                <Badge key={platform} variant="outline" className="text-xs px-2 py-0.5">
                                  <Smartphone className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                                  <span className="hidden sm:inline">{platform.toUpperCase()}</span>
                                  <span className="sm:hidden">{platform.toUpperCase().slice(0, 2)}</span>
                                </Badge>
                              ))}
                              {product.platforms?.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  +{product.platforms.length - 3}
                                </Badge>
                              )}
                              {product.countries?.slice(0, 2).map((country) => (
                                <Badge key={country} variant="outline" className="text-xs px-2 py-0.5">
                                  <Globe className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                                  {country}
                                </Badge>
                              ))}
                              {product.countries?.length > 2 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  +{product.countries.length - 2}
                                </Badge>
                              )}
                            </div>

                            {/* Categories - Smaller on mobile */}
                            {product.categories && product.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                                {product.categories.slice(0, 2).map((cat) => (
                                  <Badge key={cat.category.id} variant="outline" className="text-xs px-2 py-0.5">
                                    {cat.category.name.length > 10 ? `${cat.category.name.slice(0, 10)}...` : cat.category.name}
                                  </Badge>
                                ))}
                                {product.categories.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                                    +{product.categories.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* User Info */}
                            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                              by <span className="font-medium text-gray-700 dark:text-gray-300">
                                {product.user.name || 'Anonymous'}
                              </span>
                            </div>
                          </div>

                          {/* Desktop Action Button - Hidden on mobile */}
                          <div className="hidden md:flex flex-shrink-0">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/product/${product.id}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
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
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      {/* Product Image - Clickable on mobile */}
                      <div className="flex-shrink-0">
                        <Link href={`/product/${product.id}`} className="block">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                              <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">No Image</span>
                            </div>
                          )}
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link href={`/product/${product.id}`} className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                              {product.title}
                            </h3>
                          </Link>
                          <Badge className={`${getStatusColor(product.releaseAt)} text-xs`}>
                            {getTimeUntilRelease(product.releaseAt)}
                          </Badge>
                        </div>
                        
                        {product.tagline && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                            {product.tagline}
                          </p>
                        )}
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 hidden md:block">
                          {product.description.length > 150 ? `${product.description.substring(0, 150)}...` : product.description}
                        </p>

                        {/* Release Date */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="font-medium text-xs md:text-sm">{formatDate(product.releaseAt)}</span>
                        </div>

                        {/* Platforms & Countries - Smaller on mobile */}
                        <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                          {product.platforms?.slice(0, 3).map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs px-2 py-0.5">
                              <Smartphone className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                              <span className="hidden sm:inline">{platform.toUpperCase()}</span>
                              <span className="sm:hidden">{platform.toUpperCase().slice(0, 2)}</span>
                            </Badge>
                          ))}
                          {product.platforms?.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{product.platforms.length - 3}
                            </Badge>
                          )}
                          {product.countries?.slice(0, 2).map((country) => (
                            <Badge key={country} variant="outline" className="text-xs px-2 py-0.5">
                              <Globe className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                              {country}
                            </Badge>
                          ))}
                          {product.countries?.length > 2 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{product.countries.length - 2}
                            </Badge>
                          )}
                        </div>

                        {/* Categories - Smaller on mobile */}
                        {product.categories && product.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                            {product.categories.slice(0, 2).map((cat) => (
                              <Badge key={cat.category.id} variant="outline" className="text-xs px-2 py-0.5">
                                {cat.category.name.length > 10 ? `${cat.category.name.slice(0, 10)}...` : cat.category.name}
                              </Badge>
                            ))}
                            {product.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                +{product.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* User Info */}
                        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          by <span className="font-medium text-gray-700 dark:text-gray-300">
                            {product.user.name || 'Anonymous'}
                          </span>
                        </div>
                      </div>

                      {/* Desktop Action Button - Hidden on mobile */}
                      <div className="hidden md:flex flex-shrink-0">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/product/${product.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

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
