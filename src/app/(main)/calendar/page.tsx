'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Download, Filter, Globe, Smartphone, ChevronLeft, ChevronRight, Eye, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [listViewData, setListViewData] = useState<CalendarProduct[]>([]);
  const [listViewLoading, setListViewLoading] = useState(false);
  const [listViewTitle, setListViewTitle] = useState('');
  const [activeButton, setActiveButton] = useState<'today' | 'upcoming' | 'list' | null>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFilterOptions();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Refresh month data when currentDate changes and we're in List View
  useEffect(() => {
    refreshMonthData();
  }, [currentDate]);

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
      
      // If we have active filtered data, use it for the download
      if (activeButton === 'today' && listViewData.length > 0) {
        // Download today's releases
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        params.append('date', dateString);
      } else if (activeButton === 'upcoming' && listViewData.length > 0) {
        // Download upcoming 7 days releases
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const nextWeek = new Date(tomorrow);
        nextWeek.setDate(tomorrow.getDate() + 6);
        
        const startDateString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        const endDateString = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;
        
        params.append('startDate', startDateString);
        params.append('endDate', endDateString);
      } else {
        // Use current filters for general download
        if (filters.platform && filters.platform !== 'all') params.append('platform', filters.platform);
        if (filters.country && filters.country !== 'all') params.append('country', filters.country);
        if (filters.category && filters.category !== 'all') params.append('categoryId', filters.category);
        if (filters.year) params.append('year', filters.year);
      }
      
      const response = await fetch(`/api/calendar/ics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to download calendar');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on active filter
      let filename = 'mobile-game-hunt-calendar';
      if (activeButton === 'today') {
        filename = 'mobile-game-hunt-today-releases';
      } else if (activeButton === 'upcoming') {
        filename = 'mobile-game-hunt-upcoming-releases';
      } else if (filters.year) {
        filename = `mobile-game-hunt-calendar-${filters.year}`;
      }
      
      a.download = `${filename}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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

  const goToToday = async () => {
    setListViewLoading(true);
    setListViewTitle('Today\'s Releases');
    setViewMode('list');
    setCurrentPage(1); // Reset pagination
    setActiveButton('today'); // Set active button
    
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const response = await fetch(`/api/releases?date=${dateString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s releases');
      }
      
      const data = await response.json();
      setListViewData(data.releases || []);
    } catch (err) {
      console.error('Error fetching today\'s releases:', err);
      setListViewData([]);
    } finally {
      setListViewLoading(false);
    }
  };

  const toggleListView = async () => {
    if (viewMode === 'calendar') {
      setViewMode('list');
      setActiveButton('list');
      setListViewLoading(true);
      setListViewTitle(`${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Releases`);
      setCurrentPage(1); // Reset pagination
      
      try {
        // Calculate start and end of current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const startDateString = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-${String(startOfMonth.getDate()).padStart(2, '0')}`;
        const endDateString = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;
        
        const response = await fetch(`/api/releases/range?startDate=${startDateString}&endDate=${endDateString}`);
        if (!response.ok) {
          throw new Error('Failed to fetch month releases');
        }
        
        const data = await response.json();
        setListViewData(data.releases || []);
      } catch (err) {
        console.error('Error fetching month releases:', err);
        setListViewData([]);
      } finally {
        setListViewLoading(false);
      }
    } else {
      setViewMode('calendar');
      setActiveButton(null);
    }
  };

  const goToUpcoming = async () => {
    setListViewLoading(true);
    setListViewTitle('Upcoming Releases (Next 7 Days)');
    setViewMode('list');
    setCurrentPage(1); // Reset pagination
    setActiveButton('upcoming'); // Set active button
    
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // Start from tomorrow
      
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(tomorrow.getDate() + 6); // 7 days from tomorrow (inclusive)
      
      const startDateString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      const endDateString = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;
      
      const response = await fetch(`/api/releases/range?startDate=${startDateString}&endDate=${endDateString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming releases');
      }
      
      const data = await response.json();
      setListViewData(data.releases || []);
    } catch (err) {
      console.error('Error fetching upcoming releases:', err);
      setListViewData([]);
    } finally {
      setListViewLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Function to refresh month data when in List View
  const refreshMonthData = async () => {
    if (viewMode === 'list' && activeButton === 'list') {
      setListViewLoading(true);
      setListViewTitle(`${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Releases`);
      setCurrentPage(1);
      
      try {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const startDateString = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-${String(startOfMonth.getDate()).padStart(2, '0')}`;
        const endDateString = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;
        
        const response = await fetch(`/api/releases/range?startDate=${startDateString}&endDate=${endDateString}`);
        if (!response.ok) {
          throw new Error('Failed to fetch month releases');
        }
        
        const data = await response.json();
        setListViewData(data.releases || []);
      } catch (err) {
        console.error('Error fetching month releases:', err);
        setListViewData([]);
      } finally {
        setListViewLoading(false);
      }
    }
  };

  const handleDateClick = async (date: Date) => {
    // Check if clicking the same day - toggle accordion
    if (selectedDay && selectedDay.toDateString() === date.toDateString()) {
      setIsAccordionOpen(!isAccordionOpen);
      return;
    }

    // New day selected - close previous and open new
    setIsAccordionOpen(false);
    setSelectedDay(date);
    setCurrentPage(1); // Reset pagination for new day
    setActiveButton(null); // Clear active button state
    setLoadingReleases(true);
    
    try {
      // Fix timezone issue by using local date formatting instead of UTC
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const response = await fetch(`/api/releases?date=${dateString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      
      const data = await response.json();
      setSelectedDayReleases(data.releases || []);
      
      // Open accordion and scroll into view after animation completes
      setTimeout(() => {
        setIsAccordionOpen(true);
        setTimeout(() => {
          accordionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 750); // Wait for animation to complete (0.7s + small buffer)
      }, 50);
      
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

  // Pagination helpers
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(selectedDayReleases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReleases = selectedDayReleases.slice(startIndex, endIndex);

  // List view pagination helpers
  const listViewTotalPages = Math.ceil(listViewData.length / ITEMS_PER_PAGE);
  const listViewStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const listViewEndIndex = listViewStartIndex + ITEMS_PER_PAGE;
  const currentListViewReleases = listViewData.slice(listViewStartIndex, listViewEndIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
              className={`rounded-full text-xs transition-all duration-200 ${
                activeButton === 'today' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-purple-500' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Today
            </Button>
            <Button 
              onClick={goToUpcoming}
              variant="outline"
              size="sm"
              className={`rounded-full text-xs transition-all duration-200 ${
                activeButton === 'upcoming' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-purple-500' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Upcoming
            </Button>
            <Button 
              onClick={toggleListView}
              variant="outline"
              size="sm"
              className={`rounded-full text-xs transition-all duration-200 ${
                activeButton === 'list' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-purple-500' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
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
            className={`transition-all duration-200 ${
              activeButton === 'today' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-purple-500' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Today
          </Button>
          <Button 
            onClick={goToUpcoming}
            variant="outline"
            className={`transition-all duration-200 ${
              activeButton === 'upcoming' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-purple-500' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Upcoming (7 days)
          </Button>
          <Button 
            onClick={toggleListView}
            variant="outline"
            className={`transition-all duration-200 ${
              activeButton === 'list' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-purple-500' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
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

        {/* Selected Day Releases - Animated Accordion */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              ref={accordionRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: isAccordionOpen ? 1 : 0, 
                height: isAccordionOpen ? 'auto' : 0 
              }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.7, 
                ease: 'easeInOut',
                height: { duration: 0.7 }
              }}
              className="overflow-hidden"
            >
              <Card className="mb-8 bg-gradient-to-br from-zinc-900/40 to-zinc-800/20 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-white">
                        Game Releases - {selectedDay.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAccordionOpen(false)}
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isAccordionOpen ? 1 : 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <CardContent className="pt-0">
                    {loadingReleases ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <motion.div 
                            key={i} 
                            className="animate-pulse"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : selectedDayReleases.length === 0 ? (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-6xl mb-4">🎮</div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          No releases on this day
                        </h3>
                        <p className="text-gray-400">
                          Check back later or explore other dates for upcoming game releases.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-0">
                        {/* Compact List View */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-0"
                          >
                            {currentReleases.map((product, index) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="flex items-center py-3 px-4 border-b border-white/5 last:border-b-0"
                              >
                                {/* Small Thumbnail */}
                                <div className="flex-shrink-0 mr-3">
                                  <Link href={`/product/${product.id}`} className="block">
                                    {product.thumbnail ? (
                                      <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                                      </div>
                                    )}
                                  </Link>
                                </div>

                                {/* Game Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <Link href={`/product/${product.id}`} className="flex-1 min-w-0">
                                      <h3 className="text-sm font-semibold text-white truncate">
                                        {product.title}
                                      </h3>
                                    </Link>
                                    <Badge className={`${getStatusColor(product.releaseAt)} text-xs`}>
                                      {getTimeUntilRelease(product.releaseAt)}
                                    </Badge>
                                  </div>

                                  {/* Release Date */}
                                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(product.releaseAt)}</span>
                                  </div>

                                  {/* Platforms & Tags */}
                                  <div className="flex flex-wrap gap-1">
                                    {product.platforms?.slice(0, 2).map((platform) => (
                                      <Badge key={platform} variant="outline" className="text-xs px-1.5 py-0.5 border-purple-500/50 text-purple-300">
                                        <Smartphone className="w-2 h-2 mr-1" />
                                        {platform.toUpperCase().slice(0, 3)}
                                      </Badge>
                                    ))}
                                    {product.platforms?.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-purple-500/50 text-purple-300">
                                        +{product.platforms.length - 2}
                                      </Badge>
                                    )}
                                    {product.categories?.slice(0, 1).map((cat) => (
                                      <Badge key={cat.category.id} variant="outline" className="text-xs px-1.5 py-0.5 border-green-500/50 text-green-300">
                                        {cat.category.name.length > 8 ? `${cat.category.name.slice(0, 8)}...` : cat.category.name}
                                      </Badge>
                                    ))}
                                    {product.categories && product.categories.length > 1 && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-500/50 text-green-300">
                                        +{product.categories.length - 1}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* View Details Button */}
                                <div className="flex-shrink-0 ml-3">
                                  <Button asChild variant="outline" size="sm" className="border-purple-500/50 text-purple-300 text-xs px-3 py-1">
                                    <Link href={`/product/${product.id}`}>
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Link>
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </AnimatePresence>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="flex justify-center items-center gap-2 pt-4 border-t border-white/5"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="border-purple-500/50 text-purple-300 disabled:opacity-50"
                            >
                              Previous
                            </Button>
                            
                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                  key={page}
                                  variant={page === currentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className={`text-xs px-2 py-1 ${
                                    page === currentPage
                                      ? 'bg-purple-600 text-white'
                                      : 'border-purple-500/50 text-purple-300'
                                  }`}
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="border-purple-500/50 text-purple-300 disabled:opacity-50"
                            >
                              Next
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List View */}
        {viewMode === 'list' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {listViewTitle}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {listViewData.length} release{listViewData.length !== 1 ? 's' : ''} found
              </p>
            </CardHeader>
            <CardContent>
              {listViewLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading releases...</p>
                </div>
              ) : listViewData.length === 0 ? (
                <div className="flex justify-center">
                  <Card className="w-full max-w-md bg-gradient-to-br from-zinc-900/40 to-zinc-800/20 backdrop-blur-md border border-white/10">
                    <CardContent className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No releases found
                      </h3>
                      <p className="text-gray-400">
                        Try selecting a different time period or check back later for new releases.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Vertical Stacked Cards */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {currentListViewReleases.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="bg-gradient-to-br from-zinc-900/40 to-zinc-800/20 backdrop-blur-md border border-white/10 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02]">
                            <CardContent className="p-4 md:p-6">
                              <div className="flex flex-col md:flex-row gap-4">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  <Link href={`/product/${product.id}`} className="block">
                                    {product.thumbnail ? (
                                      <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        className="w-full md:w-32 md:h-32 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      />
                                    ) : (
                                      <div className="w-full md:w-32 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                                        <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                                      </div>
                                    )}
                                  </Link>
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 flex flex-col">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <Link href={`/product/${product.id}`} className="flex-1 min-w-0">
                                      <h3 className="text-lg md:text-xl font-semibold text-white truncate hover:text-purple-400 transition-colors">
                                        {product.title}
                                      </h3>
                                    </Link>
                                    <Badge className={`${getStatusColor(product.releaseAt)} text-xs`}>
                                      {getTimeUntilRelease(product.releaseAt)}
                                    </Badge>
                                  </div>
                                  
                                  {product.tagline && (
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                      {product.tagline}
                                    </p>
                                  )}
                                  
                                  {product.description && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                                      {product.description.length > 200 ? `${product.description.substring(0, 200)}...` : product.description}
                                    </p>
                                  )}

                                  {/* Release Date */}
                                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">{formatDate(product.releaseAt)}</span>
                                  </div>

                                  {/* Tags Row */}
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {/* Platforms */}
                                    {product.platforms?.slice(0, 3).map((platform) => (
                                      <Badge key={platform} variant="outline" className="text-xs px-2 py-1 border-purple-500/50 text-purple-300">
                                        <Smartphone className="w-3 h-3 mr-1" />
                                        {platform.toUpperCase()}
                                      </Badge>
                                    ))}
                                    {product.platforms?.length > 3 && (
                                      <Badge variant="outline" className="text-xs px-2 py-1 border-purple-500/50 text-purple-300">
                                        +{product.platforms.length - 3}
                                      </Badge>
                                    )}

                                    {/* Regions */}
                                    {product.countries?.slice(0, 2).map((country) => (
                                      <Badge key={country} variant="outline" className="text-xs px-2 py-1 border-blue-500/50 text-blue-300">
                                        <Globe className="w-3 h-3 mr-1" />
                                        {country}
                                      </Badge>
                                    ))}
                                    {product.countries?.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-2 py-1 border-blue-500/50 text-blue-300">
                                        +{product.countries.length - 2}
                                      </Badge>
                                    )}

                                    {/* Genres */}
                                    {product.categories?.slice(0, 2).map((cat) => (
                                      <Badge key={cat.category.id} variant="outline" className="text-xs px-2 py-1 border-green-500/50 text-green-300">
                                        {cat.category.name.length > 12 ? `${cat.category.name.slice(0, 12)}...` : cat.category.name}
                                      </Badge>
                                    ))}
                                    {product.categories?.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-2 py-1 border-green-500/50 text-green-300">
                                        +{product.categories.length - 2}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Author Info and View Details */}
                                  <div className="flex items-center justify-between mt-auto">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      by <span className="font-medium text-gray-300">
                                        {product.user.name || 'Anonymous'}
                                      </span>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 transition-colors">
                                      <Link href={`/product/${product.id}`}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  {/* Pagination */}
                  {listViewTotalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex justify-center items-center gap-2 pt-4 border-t border-white/5"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-purple-500/50 text-purple-300 disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: listViewTotalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`text-xs px-2 py-1 ${
                              page === currentPage
                                ? 'bg-purple-600 text-white'
                                : 'border-purple-500/50 text-purple-300'
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === listViewTotalPages}
                        className="border-purple-500/50 text-purple-300 disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
