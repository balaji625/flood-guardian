import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Radio, X, ChevronRight, Volume2 } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  area?: string;
}

// Demo alerts for when no Firebase alerts exist
const DEMO_ALERTS: Alert[] = [
  {
    id: 'demo-1',
    message: 'Heavy rainfall expected in Mumbai metropolitan region over next 24 hours. Stay prepared.',
    severity: 'warning',
    timestamp: Date.now(),
    area: 'Mumbai'
  },
  {
    id: 'demo-2',
    message: 'Flood warning issued for low-lying areas of Surat. Avoid waterlogged streets.',
    severity: 'critical',
    timestamp: Date.now() - 3600000,
    area: 'Surat'
  },
  {
    id: 'demo-3',
    message: 'Water level in Mithi River rising. Authorities monitoring situation closely.',
    severity: 'info',
    timestamp: Date.now() - 7200000,
    area: 'Mumbai'
  },
];

export function EmergencyAlertBanner({ className }: { className?: string }) {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch real alerts from Firebase
  useEffect(() => {
    const alertsRef = ref(database, 'emergencyAlerts');
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseAlerts: Alert[] = Object.entries(data)
          .map(([id, value]: [string, any]) => ({
            id,
            message: value.message,
            severity: value.severity || 'info',
            timestamp: value.timestamp || Date.now(),
            area: value.area,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);
        if (firebaseAlerts.length > 0) {
          setAlerts(firebaseAlerts);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-rotate alerts
  useEffect(() => {
    if (isPaused || alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts.length, isPaused]);

  if (!isVisible || alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];
  const severityStyles = {
    info: 'bg-primary/90 border-primary/50',
    warning: 'bg-warning/90 border-warning/50',
    critical: 'bg-destructive/90 border-destructive/50 animate-pulse',
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={cn(
        'relative overflow-hidden border-b',
        severityStyles[currentAlert.severity],
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {currentAlert.severity === 'critical' ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : (
                <Radio className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-white/90 uppercase tracking-wider">
              {currentAlert.severity === 'critical' ? 'URGENT' : 'ALERT'}
            </span>
          </div>

          {/* Center: Scrolling message */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAlert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                {currentAlert.area && (
                  <span className="hidden md:inline px-2 py-0.5 rounded bg-white/20 text-xs font-medium text-white">
                    {currentAlert.area}
                  </span>
                )}
                <p className="text-sm text-white font-medium truncate">
                  {currentAlert.message}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Counter + Close */}
          <div className="flex items-center gap-3 shrink-0">
            {alerts.length > 1 && (
              <div className="hidden sm:flex items-center gap-1">
                {alerts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      i === currentIndex ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/60'
                    )}
                  />
                ))}
              </div>
            )}
            <span className="text-xs text-white/70">
              {currentIndex + 1}/{alerts.length}
            </span>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              aria-label="Dismiss alerts"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
