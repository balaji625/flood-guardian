import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function SOSButton({ onClick, size = 'lg', className, disabled }: SOSButtonProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-lg',
    lg: 'w-32 h-32 text-xl',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-full font-bold text-white sos-button',
        'flex flex-col items-center justify-center gap-1',
        'focus:outline-none focus:ring-4 focus:ring-destructive/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-30" />
      <span className="absolute inset-2 rounded-full bg-destructive animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
      
      {/* Content */}
      <AlertTriangle className={cn(
        'relative z-10',
        size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'
      )} />
      <span className="relative z-10 font-black tracking-widest">SOS</span>
    </motion.button>
  );
}

interface EmergencyCallButtonProps {
  label: string;
  number: string;
  icon?: React.ReactNode;
  variant?: 'police' | 'ambulance' | 'fire' | 'default';
  className?: string;
}

export function EmergencyCallButton({ 
  label, 
  number, 
  icon,
  variant = 'default',
  className 
}: EmergencyCallButtonProps) {
  const variantClasses = {
    police: 'bg-blue-600 hover:bg-blue-700',
    ambulance: 'bg-red-600 hover:bg-red-700',
    fire: 'bg-orange-600 hover:bg-orange-700',
    default: 'bg-primary hover:bg-primary/90',
  };

  const handleCall = () => {
    window.location.href = `tel:${number}`;
  };

  return (
    <motion.button
      onClick={handleCall}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium',
        'transition-colors duration-200',
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon || <Phone className="w-5 h-5" />}
      <div className="flex flex-col items-start">
        <span className="text-sm opacity-80">{label}</span>
        <span className="font-bold font-mono">{number}</span>
      </div>
    </motion.button>
  );
}
