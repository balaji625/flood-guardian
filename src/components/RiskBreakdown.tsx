import React from 'react';
import { motion } from 'framer-motion';
import { FloodRiskData } from '@/types/flood';
import { Cloud, Mountain, History, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskBreakdownProps {
  data: FloodRiskData;
  className?: string;
}

export function RiskBreakdown({ data, className }: RiskBreakdownProps) {
  const factors = [
    {
      label: 'Rainfall Intensity',
      value: data.rainfallContribution,
      maxValue: 45,
      icon: Droplets,
      detail: `${data.rainfall} mm/hr`,
      color: 'bg-blue-500',
    },
    {
      label: 'Elevation Factor',
      value: data.elevationContribution,
      maxValue: 30,
      icon: Mountain,
      detail: `${data.elevation}m ASL`,
      color: 'bg-amber-500',
    },
    {
      label: 'Historical Probability',
      value: data.historicalContribution,
      maxValue: 25,
      icon: History,
      detail: `${Math.round(data.historicalProbability * 100)}% past floods`,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Cloud className="w-4 h-4" />
        Risk Factor Analysis
      </h3>

      <div className="space-y-3">
        {factors.map((factor, index) => (
          <motion.div
            key={factor.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <factor.icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{factor.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">{factor.detail}</span>
                <span className="font-mono font-bold">{factor.value}%</span>
              </div>
            </div>
            
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', factor.color)}
                initial={{ width: 0 }}
                animate={{ width: `${(factor.value / factor.maxValue) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Total Risk Score</span>
          <span className="font-mono font-bold text-lg">{data.score}/100</span>
        </div>
      </div>
    </div>
  );
}
