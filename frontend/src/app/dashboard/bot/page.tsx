'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBot } from '@/hooks/use-bot';
import { useFeeds } from '@/context/feeds-context';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Terminal,
  Zap,
  AlertTriangle,
  Info,
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { BotLogEntry } from '@/lib/bot-service';

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function LogEntry({ entry }: { entry: BotLogEntry }) {
  const levelColors = {
    debug: 'text-gray-400',
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
  };

  const levelIcons = {
    debug: '🔍',
    info: '📝',
    warn: '⚠️',
    error: '❌',
  };

  const time = new Date(entry.timestamp).toLocaleTimeString();

  return (
    <div className={`font-mono text-xs ${levelColors[entry.level]} py-0.5`}>
      <span className="text-muted-foreground">[{time}]</span>{' '}
      <span>{levelIcons[entry.level]}</span>{' '}
      <span>{entry.message}</span>
    </div>
  );
}

export default function BotPage() {
  const { 
    status, 
    stats, 
    logs, 
    config,
    isLoading, 
    error, 
    start, 
    stop, 
    refresh 
  } = useBot();
  
  const { feeds } = useFeeds();
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    const success = await start(privateKey || undefined);
    setIsStarting(false);
    
    if (success) {
      toast.success('Bot started successfully!');
      setPrivateKey('');
      setShowPrivateKeyInput(false);
    } else {
      toast.error('Failed to start bot');
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    const success = await stop();
    setIsStopping(false);
    
    if (success) {
      toast.success('Bot stopped');
    } else {
      toast.error('Failed to stop bot');
    }
  };

  const statusConfig = {
    stopped: { color: 'bg-gray-500', text: 'Stopped', icon: Square },
    starting: { color: 'bg-yellow-500 animate-pulse', text: 'Starting...', icon: Loader2 },
    running: { color: 'bg-green-500 animate-pulse', text: 'Running', icon: Activity },
    stopping: { color: 'bg-yellow-500', text: 'Stopping...', icon: Loader2 },
    error: { color: 'bg-red-500', text: 'Error', icon: XCircle },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen">
      <Header 
        title="Bot Control" 
        description="Run and monitor the Custom Feeds Bot"
      />

      <div className="p-6 space-y-6">
        {/* Status and Control */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Bot Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${currentStatus.color}`} />
                  <div>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${status === 'running' ? 'animate-spin' : ''}`} />
                      {currentStatus.text}
                    </p>
                    {stats?.startTime && status === 'running' && (
                      <p className="text-sm text-muted-foreground">
                        Uptime: {formatUptime(stats.uptimeSeconds)}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={refresh}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3 pt-2">
                {status === 'stopped' || status === 'error' ? (
                  <>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleStart}
                      disabled={isStarting || isLoading}
                    >
                      {isStarting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Start Bot
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowPrivateKeyInput(!showPrivateKeyInput)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="flex-1"
                    variant="destructive"
                    onClick={handleStop}
                    disabled={isStopping || status === 'stopping'}
                  >
                    {isStopping ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    Stop Bot
                  </Button>
                )}
              </div>

              {/* Private Key Input (Optional) */}
              {showPrivateKeyInput && status === 'stopped' && (
                <div className="pt-4 border-t space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="privateKey">Private Key (optional)</Label>
                    <Input
                      id="privateKey"
                      type="password"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      placeholder="0x... or leave blank to use env var"
                    />
                    <p className="text-xs text-muted-foreground">
                      If not provided, uses DEPLOYER_PRIVATE_KEY from environment
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">
                    {stats?.totalUpdates || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Updates</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold text-green-500">
                    {stats?.successfulUpdates || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold text-red-500">
                    {stats?.failedUpdates || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">
                    {feeds.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Configured Feeds</div>
                </div>
              </div>

              {stats?.lastUpdateTime && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Last update: {new Date(stats.lastUpdateTime).toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>About the Bot:</strong> When running, the bot automatically updates your deployed 
            feeds at the configured interval. It handles the full FDC attestation workflow for both 
            direct chains (Flare, Ethereum) and relay chains (Arbitrum, Base, etc.).
          </AlertDescription>
        </Alert>

        {/* Console Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Console Log
            </CardTitle>
            <CardDescription>
              Real-time bot activity log
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black/90 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No logs yet. Start the bot to see activity.
                </div>
              ) : (
                <div className="space-y-0.5">
                  {logs.map((entry, i) => (
                    <LogEntry key={`${entry.timestamp}-${i}`} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feed Status Grid */}
        {feeds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Feed Status</CardTitle>
              <CardDescription>
                Per-feed update statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeds.map((feed) => {
                  const feedStats = stats?.feedStats[feed.id];
                  return (
                    <div 
                      key={feed.id}
                      className="p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold truncate">{feed.alias}</span>
                        {feedStats?.lastUpdate ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Updates: {feedStats?.updates || 0}</div>
                        <div>Failures: {feedStats?.failures || 0}</div>
                        {feedStats?.lastPrice && (
                          <div>Last Price: {feedStats.lastPrice}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CLI Alternative */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4" />
              CLI Alternative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              You can also run the bot from the terminal for standalone operation:
            </p>
            <pre className="p-3 rounded-lg bg-black/90 text-green-400 text-sm overflow-x-auto">
              <code>node src/custom-feeds-bot.js</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
