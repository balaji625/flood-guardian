import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  Wifi, 
  CloudOff, 
  CheckCircle, 
  RefreshCw,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OfflineIndicatorProps {
  className?: string;
}

interface CachedData {
  shelters: boolean;
  emergencyNumbers: boolean;
  safeRoutes: boolean;
  lastSync: string | null;
}

const CACHE_KEY = 'flood-guard-offline-cache';

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);
  const [cachedData, setCachedData] = useState<CachedData>({
    shelters: false,
    emergencyNumbers: false,
    safeRoutes: false,
    lastSync: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Using cached data.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data status
    loadCacheStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheStatus = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setCachedData(JSON.parse(cached));
      } catch {
        console.error('Failed to load cache status');
      }
    }
  };

  const syncData = async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);

    // Simulate syncing data
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newCacheData: CachedData = {
      shelters: true,
      emergencyNumbers: true,
      safeRoutes: true,
      lastSync: new Date().toISOString(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(newCacheData));
    setCachedData(newCacheData);
    setIsSyncing(false);
    toast.success('Data synced for offline use');
  };

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const hasAnyCache = cachedData.shelters || cachedData.emergencyNumbers || cachedData.safeRoutes;

  return (
    <div className={cn('relative', className)}>
      {/* Compact indicator */}
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          isOnline 
            ? 'bg-success/10 text-success border border-success/30' 
            : 'bg-warning/10 text-warning border border-warning/30'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </>
        )}
      </motion.button>

      {/* Details dropdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 glass-card rounded-xl overflow-hidden z-50 shadow-elevated"
          >
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-success" />
                  ) : (
                    <CloudOff className="w-5 h-5 text-warning" />
                  )}
                  <span className="font-semibold text-sm">
                    {isOnline ? 'Connected' : 'Offline Mode'}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 h-7 text-xs"
                  onClick={syncData}
                  disabled={!isOnline || isSyncing}
                >
                  <RefreshCw className={cn('w-3 h-3', isSyncing && 'animate-spin')} />
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                {isOnline 
                  ? 'Sync critical data for offline access during emergencies.'
                  : 'Using cached data. Some features may be limited.'
                }
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    Shelter Locations
                  </span>
                  {cachedData.shelters ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Not cached</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    Emergency Numbers
                  </span>
                  {cachedData.emergencyNumbers ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Not cached</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    Safe Routes
                  </span>
                  {cachedData.safeRoutes ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Not cached</Badge>
                  )}
                </div>
              </div>

              {cachedData.lastSync && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  Last synced: {formatLastSync(cachedData.lastSync)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}
