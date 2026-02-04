import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, 
  AlertTriangle, 
  Wind, 
  Thermometer, 
  CloudLightning,
  Waves,
  X,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WeatherAlert {
  id: string;
  type: 'rain' | 'storm' | 'flood' | 'heat' | 'wind';
  severity: 'warning' | 'watch' | 'advisory';
  title: string;
  description: string;
  region: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

interface WeatherAlertsProps {
  className?: string;
  location?: { name: string; lat: number; lng: number } | null;
}

const DEMO_ALERTS: WeatherAlert[] = [
  {
    id: '1',
    type: 'rain',
    severity: 'warning',
    title: 'Heavy Rainfall Warning',
    description: 'Heavy rainfall expected with 80-100mm precipitation in the next 24 hours. Possibility of waterlogging in low-lying areas.',
    region: 'Mumbai Metropolitan Region',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '2',
    type: 'storm',
    severity: 'watch',
    title: 'Thunderstorm Watch',
    description: 'Thunderstorm with gusty winds up to 50 km/h expected. Take precautions for outdoor activities.',
    region: 'Western Maharashtra',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: '3',
    type: 'flood',
    severity: 'advisory',
    title: 'Flood Advisory',
    description: 'Rivers expected to rise. Areas along Mithi River should remain vigilant.',
    region: 'Mithi River Basin',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
    isActive: true,
  },
];

const ALERT_CONFIG = {
  rain: { icon: CloudRain, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  storm: { icon: CloudLightning, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  flood: { icon: Waves, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  heat: { icon: Thermometer, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  wind: { icon: Wind, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
};

const SEVERITY_CONFIG = {
  warning: { label: 'Warning', color: 'destructive' as const },
  watch: { label: 'Watch', color: 'secondary' as const },
  advisory: { label: 'Advisory', color: 'outline' as const },
};

export function WeatherAlerts({ className, location }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate fetching alerts based on location
    const timer = setTimeout(() => {
      setAlerts(DEMO_ALERTS);
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  const activeAlerts = alerts.filter(a => a.isActive && !dismissedAlerts.has(a.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    toast.info('Alert dismissed');
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    toast.success(enabled ? 'Weather notifications enabled' : 'Weather notifications disabled');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card rounded-xl overflow-hidden', className)}
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-border/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Weather Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    {activeAlerts.length} Active
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time severe weather warnings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 text-primary" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No Active Alerts</p>
                  <p className="text-xs">Weather conditions are normal in your area</p>
                </div>
              ) : (
                activeAlerts.map((alert) => {
                  const config = ALERT_CONFIG[alert.type];
                  const severity = SEVERITY_CONFIG[alert.severity];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        'p-4 rounded-lg border transition-all',
                        alert.severity === 'warning' 
                          ? 'border-destructive/30 bg-destructive/5' 
                          : 'border-border/50 bg-muted/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          config.bgColor
                        )}>
                          <Icon className={cn('w-5 h-5', config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={severity.color} className="text-xs">
                                  {severity.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {alert.region}
                                </span>
                              </div>
                              <h4 className="font-semibold text-sm">{alert.title}</h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleDismiss(alert.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>

                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {alert.description}
                          </p>

                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Valid until {formatTime(alert.validUntil)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
