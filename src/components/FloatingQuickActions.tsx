import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Navigation,
  Shield,
  Home,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FloatingQuickActionsProps {
  className?: string;
  onSOSClick?: () => void;
}

const QUICK_ACTIONS = [
  {
    id: 'sos',
    icon: AlertTriangle,
    label: 'Send SOS',
    color: 'bg-destructive',
    action: 'sos',
  },
  {
    id: 'call-100',
    icon: Shield,
    label: 'Police (100)',
    color: 'bg-blue-600',
    phone: '100',
  },
  {
    id: 'call-108',
    icon: Phone,
    label: 'Ambulance (108)',
    color: 'bg-green-600',
    phone: '108',
  },
  {
    id: 'shelters',
    icon: Home,
    label: 'Find Shelters',
    color: 'bg-purple-600',
    scroll: '#shelters',
  },
  {
    id: 'siren',
    icon: Volume2,
    label: 'Play Siren',
    color: 'bg-orange-600',
    action: 'siren',
  },
];

export function FloatingQuickActions({ className, onSOSClick }: FloatingQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);

  const handleAction = (action: typeof QUICK_ACTIONS[number]) => {
    if (action.phone) {
      window.location.href = `tel:${action.phone}`;
      toast.success(`Calling ${action.label}...`);
    } else if (action.scroll) {
      const element = document.querySelector(action.scroll);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action.action === 'sos') {
      onSOSClick?.();
    } else if (action.action === 'siren') {
      playSiren();
    }
    
    setIsOpen(false);
  };

  const playSiren = () => {
    if (isPlayingSiren) {
      setIsPlayingSiren(false);
      toast.info('Siren stopped');
      return;
    }

    setIsPlayingSiren(true);
    toast.success('Playing emergency siren');

    // Create audio context for siren
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sawtooth';
      gainNode.gain.value = 0.3;

      let freq = 440;
      const interval = setInterval(() => {
        freq = freq === 440 ? 880 : 440;
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      }, 500);

      oscillator.start();

      // Stop after 5 seconds
      setTimeout(() => {
        clearInterval(interval);
        oscillator.stop();
        setIsPlayingSiren(false);
      }, 5000);
    } catch (error) {
      console.error('Audio not supported');
      setIsPlayingSiren(false);
    }
  };

  return (
    <div className={cn('fixed bottom-24 right-6 z-50', className)}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3 z-50"
            >
              {QUICK_ACTIONS.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 justify-end"
                >
                  <span className="px-3 py-1.5 rounded-lg bg-card text-sm font-medium shadow-lg whitespace-nowrap">
                    {action.label}
                  </span>
                  <Button
                    size="icon"
                    className={cn(
                      'w-12 h-12 rounded-full shadow-lg',
                      action.color,
                      'text-white hover:opacity-90'
                    )}
                    onClick={() => handleAction(action)}
                  >
                    <action.icon className="w-5 h-5" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          className={cn(
            'w-14 h-14 rounded-full shadow-xl',
            isOpen 
              ? 'bg-muted text-foreground' 
              : 'bg-gradient-primary text-white'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
