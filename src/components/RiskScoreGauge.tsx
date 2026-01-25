import React from 'react';
import { motion } from 'framer-motion';
import { RiskLevel } from '@/types/flood';
import { getRiskLabel } from '@/lib/floodRiskCalculator';
import { cn } from '@/lib/utils';

interface RiskScoreGaugeProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export function RiskScoreGauge({ 
  score, 
  level, 
  size = 'md', 
  showLabel = true,
  animated = true 
}: RiskScoreGaugeProps) {
  const sizeClasses = {
    sm: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    md: { container: 'w-36 h-36', text: 'text-4xl', label: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-5xl', label: 'text-base' },
  };

  const colorClasses = {
    low: 'text-success stroke-success',
    medium: 'text-warning stroke-warning',
    high: 'text-destructive stroke-destructive',
    critical: 'text-critical stroke-critical',
  };

  const bgGradients = {
    low: 'from-success/20 to-success/5',
    medium: 'from-warning/20 to-warning/5',
    high: 'from-destructive/20 to-destructive/5',
    critical: 'from-critical/20 to-critical/5',
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size].container)}>
      {/* Background glow */}
      <div className={cn(
        'absolute inset-0 rounded-full bg-gradient-radial',
        bgGradients[level],
        level === 'critical' && 'animate-pulse'
      )} />

      {/* SVG Gauge */}
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={colorClasses[level]}
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.span
          className={cn('font-bold font-mono', sizeClasses[size].text, colorClasses[level])}
          initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        {showLabel && (
          <span className={cn('font-semibold tracking-wider mt-1', sizeClasses[size].label, colorClasses[level])}>
            {getRiskLabel(level)}
          </span>
        )}
      </div>

      {/* Pulse ring for critical */}
      {level === 'critical' && (
        <div className="absolute inset-0 rounded-full border-2 border-critical animate-pulse-ring" />
      )}
    </div>
  );
}
