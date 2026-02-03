import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Droplets, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WaterLevelDataPoint {
  time: string;
  level: number;
  rainfall: number;
  predicted?: boolean;
}

interface WaterLevelTrendsProps {
  locationName?: string;
  className?: string;
}

// Generate realistic demo data
function generateDemoData(): WaterLevelDataPoint[] {
  const now = new Date();
  const data: WaterLevelDataPoint[] = [];
  
  // Historical data (past 12 hours)
  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseLevel = 2.5 + Math.sin(i * 0.5) * 0.8;
    const rainfall = Math.max(0, 15 + Math.sin(i * 0.3) * 20 + (Math.random() - 0.5) * 10);
    
    data.push({
      time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      level: parseFloat((baseLevel + (Math.random() - 0.5) * 0.3).toFixed(2)),
      rainfall: parseFloat(rainfall.toFixed(1)),
      predicted: false,
    });
  }
  
  // Predicted data (next 6 hours)
  const lastLevel = data[data.length - 1].level;
  for (let i = 1; i <= 6; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    // Simulate rising trend
    const predictedLevel = lastLevel + i * 0.15 + (Math.random() - 0.3) * 0.2;
    const predictedRainfall = Math.max(0, 25 + i * 3 + (Math.random() - 0.5) * 8);
    
    data.push({
      time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      level: parseFloat(predictedLevel.toFixed(2)),
      rainfall: parseFloat(predictedRainfall.toFixed(1)),
      predicted: true,
    });
  }
  
  return data;
}

export function WaterLevelTrends({ locationName = 'Your Area', className }: WaterLevelTrendsProps) {
  const [data, setData] = useState<WaterLevelDataPoint[]>([]);
  const [activeTab, setActiveTab] = useState('level');

  useEffect(() => {
    setData(generateDemoData());
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      setData(generateDemoData());
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const currentLevel = data.find(d => !d.predicted)?.level || 0;
  const previousLevel = data.length > 2 ? data[data.length - 8]?.level || currentLevel : currentLevel;
  const trend = currentLevel > previousLevel ? 'rising' : currentLevel < previousLevel ? 'falling' : 'stable';
  const maxPredicted = Math.max(...data.filter(d => d.predicted).map(d => d.level));
  
  const dangerLevel = 4.0;
  const warningLevel = 3.0;
  const status = maxPredicted >= dangerLevel ? 'danger' : maxPredicted >= warningLevel ? 'warning' : 'safe';

  const TrendIcon = trend === 'rising' ? TrendingUp : trend === 'falling' ? TrendingDown : Minus;
  const trendColor = trend === 'rising' ? 'text-destructive' : trend === 'falling' ? 'text-success' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card rounded-xl overflow-hidden', className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Water Level Trends</h3>
              <p className="text-xs text-muted-foreground">{locationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={status === 'danger' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}
              className="gap-1"
            >
              {status === 'danger' && <AlertTriangle className="w-3 h-3" />}
              {status === 'danger' ? 'High Risk' : status === 'warning' ? 'Moderate' : 'Normal'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 divide-x divide-border/50 border-b border-border/50">
        <div className="p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Current Level</p>
          <p className="text-lg font-bold">{currentLevel.toFixed(1)}m</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Trend</p>
          <div className={cn('flex items-center justify-center gap-1 font-medium', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm capitalize">{trend}</span>
          </div>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">6hr Prediction</p>
          <p className={cn('text-lg font-bold', maxPredicted >= dangerLevel ? 'text-destructive' : '')}>
            {maxPredicted.toFixed(1)}m
          </p>
        </div>
      </div>

      {/* Chart */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid grid-cols-2 w-full max-w-[200px] mb-4">
          <TabsTrigger value="level" className="text-xs">Water Level</TabsTrigger>
          <TabsTrigger value="rainfall" className="text-xs">Rainfall</TabsTrigger>
        </TabsList>

        <TabsContent value="level" className="mt-0">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)}m`,
                    name === 'level' ? 'Water Level' : name
                  ]}
                />
                {/* Danger threshold line */}
                <Line
                  type="monotone"
                  dataKey={() => dangerLevel}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name="Danger Level"
                />
                <Area
                  type="monotone"
                  dataKey="level"
                  stroke="hsl(var(--primary))"
                  fill="url(#waterGradient)"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.predicted) {
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={3} 
                          fill="hsl(var(--warning))" 
                          stroke="white" 
                          strokeWidth={1}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="rainfall" className="mt-0">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  unit="mm"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}mm`, 'Rainfall']}
                />
                <Area
                  type="monotone"
                  dataKey="rainfall"
                  stroke="hsl(var(--accent))"
                  fill="url(#rainGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span>Historical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning border border-white" />
            <span>AI Predicted</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-destructive rounded" style={{ borderStyle: 'dashed' }} />
            <span>Danger Level</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
