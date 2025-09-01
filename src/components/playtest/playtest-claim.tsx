'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
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

export function PlaytestClaim({ gameId, gameTitle }: PlaytestClaimProps) {
  const { data: session } = useSession();
  const [playtest, setPlaytest] = useState<Playtest | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchPlaytest();
  }, [gameId]);

  const fetchPlaytest = async () => {
    try {
      const response = await fetch(`/api/playtest?gameId=${gameId}`, {
        credentials: 'include',
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

  const handleClaim = async () => {
    if (!playtest) return;

    setClaiming(true);
    try {
      const response = await fetch('/api/playtest/claim', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          playtestId: playtest.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim playtest');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchPlaytest(); // Refresh data
    } catch (error) {
      console.error('Error claiming playtest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to claim playtest');
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
              {playtest.expiresAt ? getTimeUntilExpiry(playtest.expiresAt) : 'No Expiry'}
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
