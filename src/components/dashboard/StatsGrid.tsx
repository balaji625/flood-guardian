import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  color?: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, change, color = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold font-mono mt-1">{value}</p>
              {change && (
                <p className={cn('text-xs mt-1', color)}>
                  {change}
                </p>
              )}
            </div>
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color, 'bg-current/10')}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatsGridProps {
  stats: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    color?: string;
  }[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
