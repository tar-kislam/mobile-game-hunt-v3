'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Clock, Key, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Playtest {
  id: string;
  gameId: string;
  quota: number;
  expiresAt?: string;
  createdAt: string;
  remainingQuota: number;
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

interface PlaytestManagerProps {
  gameId: string;
  gameTitle: string;
}

export function PlaytestManager({ gameId, gameTitle }: PlaytestManagerProps) {
  const { data: session, status } = useSession();
  const [playtest, setPlaytest] = useState<Playtest | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    quota: 10,
    expiresAt: '',
  });
  const [apiKey, setApiKey] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPlaytest();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
    
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem(`playtest-api-key-${gameId}`);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, [gameId, status, session]);

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
        // No playtest exists yet
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

  const handleCreatePlaytest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error('You must be logged in to create a playtest');
      return;
    }

    setCreating(true);

    try {
      const requestBody = {
        gameId,
        quota: formData.quota,
        expiresAt: formData.expiresAt || undefined,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add API key to headers if available
      const savedApiKey = localStorage.getItem(`playtest-api-key-${gameId}`);
      if (savedApiKey) {
        headers['X-Playtest-API-Key'] = savedApiKey;
      }

      const response = await fetch('/api/playtest', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Clone the response so we can read it multiple times
        const responseClone = response.clone();

        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        } catch (parseError) {
          // If we can't parse the error response as JSON, try to get the raw text
          try {
            const responseText = await responseClone.text();
            throw new Error(responseText || `HTTP ${response.status}: ${response.statusText}`);
          } catch (textError) {
            // If we can't read the response at all, provide a generic error
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        }
      }

      const data = await response.json();
      toast.success(data.message);
      setIsDialogOpen(false);
      fetchPlaytest();
    } catch (error) {
      console.error('Error creating playtest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create playtest');
    } finally {
      setCreating(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Playtest Keys
        </CardTitle>
        <CardDescription>
          Manage playtest key distribution for {gameTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* API Key Section */}
        <div className="space-y-3 mb-6">
          <Label htmlFor="api-key-manager" className="text-sm font-medium">
            API Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="api-key-manager"
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
            Copy your API key from your developer dashboard to authenticate your playtest management
          </p>
        </div>

        {playtest ? (
          <div className="space-y-4">
            {/* Playtest Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{playtest.quota}</div>
                <div className="text-sm text-muted-foreground">Total Keys</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{playtest.remainingQuota}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{playtest._count.claims}</div>
                <div className="text-sm text-muted-foreground">Claimed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {playtest.expiresAt ? formatDate(playtest.expiresAt) : 'No Expiry'}
                </div>
                <div className="text-sm text-muted-foreground">Expires</div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2">
              {playtest.isExpired && (
                <Badge variant="destructive">Expired</Badge>
              )}
              {playtest.isQuotaFull && (
                <Badge variant="secondary">Quota Full</Badge>
              )}
              {!playtest.isExpired && !playtest.isQuotaFull && (
                <Badge variant="default">Active</Badge>
              )}
            </div>

            {/* Claims List */}
            {playtest.claims.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recent Claims</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {playtest.claims.slice(0, 5).map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{claim.user.name || claim.user.email}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {formatDate(claim.claimedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Playtest Created</h3>
            <p className="text-muted-foreground mb-4">
              Create a playtest to distribute keys to users
            </p>
            {session?.user ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Playtest
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Playtest</DialogTitle>
                  <DialogDescription>
                    Set up playtest key distribution for {gameTitle}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePlaytest} className="space-y-4">
                  <div>
                    <Label htmlFor="quota">Number of Keys</Label>
                    <Input
                      id="quota"
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.quota}
                      onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? 'Creating...' : 'Create Playtest'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please log in to create a playtest
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
