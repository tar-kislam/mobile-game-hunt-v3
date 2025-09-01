'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Users, Clock, CheckCircle, XCircle, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Playtest {
  id: string;
  gameId: string;
  quota: number;
  expiresAt?: string;
  createdAt: string;
  remainingQuota: number;
  hasClaimed: boolean;
  isExpired: boolean;
  isQuotaFull: boolean;
  product: {
    title: string;
    tagline?: string;
    image?: string;
  };
  claims: Array<{
    id: string;
    claimedAt: string;
    user: {
      id: string;
      name?: string;
      email?: string;
    };
  }>;
  _count: {
    claims: number;
  };
}

interface PlaytestClaimProps {
  gameId: string;
  gameTitle: string;
}

// Countdown Timer Component
interface CountdownTimerProps {
  expiryDate: string;
  className?: string;
}

function CountdownTimer({ expiryDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [prevTime, setPrevTime] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setPrevTime(timeLeft);
      setTimeLeft({ hours, minutes, seconds });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (isExpired) {
    return (
      <div className={`text-2xl font-bold text-red-600 ${className}`}>
        Expired
      </div>
    );
  }

  // Show hours when more than 1 hour remaining, otherwise show MM:SS
  const showHours = timeLeft.hours > 0;

  if (showHours) {
    return (
      <div className={`text-2xl font-bold text-orange-600 ${className}`}>
        <span 
          className="inline-block min-w-[1.5ch] text-center transition-all duration-300 ease-out"
          style={{
            transform: timeLeft.hours !== prevTime.hours ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {timeLeft.hours}
        </span>
        <span className="mx-1">h</span>
      </div>
    );
  }

  return (
    <div className={`text-2xl font-bold text-orange-600 ${className}`}>
      <span 
        className="inline-block min-w-[1.5ch] text-center transition-all duration-300 ease-out"
        style={{
          transform: timeLeft.minutes !== prevTime.minutes ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {String(timeLeft.minutes).padStart(2, '0')}
      </span>
      <span className="mx-1">:</span>
      <span 
        className="inline-block min-w-[1.5ch] text-center transition-all duration-300 ease-out"
        style={{
          transform: timeLeft.seconds !== prevTime.seconds ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export function PlaytestClaim({ gameId, gameTitle }: PlaytestClaimProps) {
  const { data: session } = useSession();
  const [playtest, setPlaytest] = useState<Playtest | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);

  useEffect(() => {
    fetchPlaytest();
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem(`playtest-api-key-${gameId}`);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, [gameId]);

  const fetchPlaytest = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add API key to headers if available
      const savedApiKey = localStorage.getItem(`playtest-api-key-${gameId}`);
      if (savedApiKey) {
        headers['X-Playtest-API-Key'] = savedApiKey;
      }

      const response = await fetch(`/api/playtest?gameId=${gameId}`, {
        credentials: 'include',
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setPlaytest(data.playtest);
      } else if (response.status === 404) {
        // No playtest exists
        setPlaytest(null);
      }
    } catch (error) {
      console.error('Error fetching playtest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setSavingApiKey(true);
    try {
      // Store API key in localStorage
      localStorage.setItem(`playtest-api-key-${gameId}`, apiKey.trim());
      toast.success('API key saved successfully');
      
      // Refresh playtest data with new API key
      await fetchPlaytest();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setSavingApiKey(false);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success('API key copied to clipboard');
    }
  };

  const handleClaim = async () => {
    if (!playtest) return;

    setClaiming(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add API key to headers if available
      const savedApiKey = localStorage.getItem(`playtest-api-key-${gameId}`);
      if (savedApiKey) {
        headers['X-Playtest-API-Key'] = savedApiKey;
      }

      const response = await fetch('/api/playtest/claim', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          playtestId: playtest.id,
        }),
      });

      if (!response.ok) {
        // Always try to parse JSON response first
        try {
          const errorData = await response.json();
          const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          
          // Handle specific error statuses with user-friendly messages
          if (response.status === 400) {
            toast.error(`Validation error: ${errorMessage}`);
          } else if (response.status === 401 || response.status === 403) {
            toast.error('Please log in to claim a playtest key');
          } else if (response.status === 404) {
            toast.error('Playtest not found');
          } else if (response.status === 409) {
            if (errorMessage.includes('Already claimed')) {
              toast.error('You have already claimed this playtest');
            } else if (errorMessage.includes('No quota left')) {
              toast.error('No playtest keys available');
            } else {
              toast.error(errorMessage);
            }
          } else if (response.status === 410) {
            toast.error('This playtest has expired');
          } else if (response.status === 500) {
            toast.error('Something went wrong, please try again later');
            console.error('Server error:', errorData);
          } else {
            toast.error(errorMessage);
          }
          return;
        } catch (parseError) {
          // If JSON parsing fails, show generic error
          toast.error(`HTTP ${response.status}: ${response.statusText}`);
          return;
        }
      }

      const data = await response.json();
      toast.success(data.message || 'Playtest claimed successfully');
      fetchPlaytest(); // Refresh data
    } catch (error) {
      console.error('Error claiming playtest:', error);
      toast.error('Failed to claim playtest. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playtest) {
    return null; // Don't show anything if no playtest exists
  }

  return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Playtest Available
        </CardTitle>
        <CardDescription>
          Get early access to {gameTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Section */}
        <div className="space-y-3">
          <Label htmlFor="api-key" className="text-sm font-medium">
            API Key
          </Label>
          {playtest.hasClaimed ? (
            /* Show API key as read-only when claimed */
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="text"
                  value={apiKey || 'API key will be shown here after claiming'}
                  readOnly
                  className="flex-1 bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyApiKey}
                  disabled={!apiKey}
                  title="Copy API key"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is now visible and ready to use
              </p>
            </div>
          ) : (
            /* Show editable API key input when not claimed */
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key from dashboard"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyApiKey}
                  disabled={!apiKey}
                  title="Copy API key"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={savingApiKey || !apiKey.trim()}
                  size="sm"
                >
                  {savingApiKey ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy your API key from your developer dashboard to authenticate your playtest session
              </p>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{playtest.remainingQuota}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{playtest._count.claims}</div>
            <div className="text-sm text-muted-foreground">Claimed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {playtest.expiresAt ? <CountdownTimer expiryDate={playtest.expiresAt} /> : 'No Expiry'}
            </div>
            <div className="text-sm text-muted-foreground">Time Left</div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 justify-center">
          {playtest.hasClaimed && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Already Claimed
            </Badge>
          )}
          {playtest.isExpired && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Expired
            </Badge>
          )}
          {playtest.isQuotaFull && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Quota Full
            </Badge>
          )}
          {!playtest.hasClaimed && !playtest.isExpired && !playtest.isQuotaFull && (
            <Badge variant="default" className="flex items-center gap-1">
              <Key className="w-3 h-3" />
              Available
            </Badge>
          )}
        </div>

        {/* Action Button */}
        {!session ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Sign in to claim your playtest key
            </p>
            <Button variant="outline" size="sm">
              Sign In to Claim
            </Button>
          </div>
        ) : playtest.hasClaimed ? (
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">
              ✓ You have claimed this playtest
            </p>
            <p className="text-xs text-muted-foreground">
              Check your email for access instructions
            </p>
          </div>
        ) : playtest.isExpired || playtest.isQuotaFull ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {playtest.isExpired ? 'This playtest has expired' : 'All keys have been claimed'}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full"
            >
              {claiming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Claiming...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Claim Playtest Key
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Limited availability - claim while supplies last
            </p>
          </div>
        )}

        {/* Expiry Info */}
        {playtest.expiresAt && (
          <div className="text-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            Expires: {formatDate(playtest.expiresAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
