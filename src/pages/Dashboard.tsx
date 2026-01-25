import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Waves,
  AlertTriangle,
  MapPin,
  Users,
  Activity,
  Phone,
  LogOut,
  Bell,
  Settings,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Building2,
  Flame,
  Shield,
  Radio,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { FloodMap } from '@/components/FloodMap';
import { RiskScoreGauge } from '@/components/RiskScoreGauge';
import { SOSRequest, RiskLevel } from '@/types/flood';
import { cn } from '@/lib/utils';

// Mock SOS data
const mockSOSRequests: SOSRequest[] = [
  {
    id: '1',
    location: { lat: 19.076, lng: 72.8777, address: 'Mumbai Central' },
    emergencyType: 'flood',
    description: 'Water entering ground floor',
    status: 'pending',
    timestamp: Date.now() - 300000,
    priority: 'high',
    peopleCount: 4,
  },
  {
    id: '2',
    location: { lat: 19.082, lng: 72.872, address: 'Andheri East' },
    emergencyType: 'trapped',
    description: 'Family trapped on second floor',
    status: 'acknowledged',
    timestamp: Date.now() - 600000,
    priority: 'critical',
    peopleCount: 6,
  },
  {
    id: '3',
    location: { lat: 19.068, lng: 72.865, address: 'Dadar West' },
    emergencyType: 'medical',
    description: 'Elderly person needs evacuation',
    status: 'dispatched',
    timestamp: Date.now() - 900000,
    priority: 'high',
    peopleCount: 2,
  },
];

const statsData = [
  { label: 'Active Alerts', value: '12', icon: AlertTriangle, change: '+3', color: 'text-destructive' },
  { label: 'SOS Requests', value: '8', icon: Phone, change: '+2', color: 'text-warning' },
  { label: 'People Evacuated', value: '1,247', icon: Users, change: '+156', color: 'text-success' },
  { label: 'Areas Monitored', value: '45', icon: MapPin, change: '0', color: 'text-primary' },
];

const roleIcons = {
  admin: Shield,
  authority: AlertTriangle,
  police: Shield,
  hospital: Building2,
  ambulance: Truck,
  fire: Flame,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sosRequests, setSOSRequests] = useState<SOSRequest[]>(mockSOSRequests);
  const [selectedArea, setSelectedArea] = useState<{ name: string; risk: RiskLevel; score: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSOSAction = (sosId: string, action: 'acknowledge' | 'dispatch' | 'resolve') => {
    setSOSRequests(prev => prev.map(sos => {
      if (sos.id === sosId) {
        const newStatus = action === 'acknowledge' ? 'acknowledged' : 
                         action === 'dispatch' ? 'dispatched' : 'resolved';
        return { ...sos, status: newStatus };
      }
      return sos;
    }));
  };

  if (!user) return null;

  const RoleIcon = roleIcons[user.role] || Shield;

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Waves className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">FloodGuard</h1>
              <p className="text-xs text-muted-foreground capitalize">{user.role} Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <RoleIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.department}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold font-mono mt-1">{stat.value}</p>
                      <p className={cn('text-xs mt-1', stat.color)}>
                        {stat.change} from yesterday
                      </p>
                    </div>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.color, 'bg-current/10')}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Live Flood Map
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <FloodMap location={null} riskLevel="medium" showServices className="h-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Overview */}
          <div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Area Risk Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Mumbai Central', risk: 'high' as RiskLevel, score: 78 },
                  { name: 'Andheri East', risk: 'critical' as RiskLevel, score: 92 },
                  { name: 'Bandra West', risk: 'medium' as RiskLevel, score: 45 },
                  { name: 'Powai', risk: 'low' as RiskLevel, score: 22 },
                ].map((area) => (
                  <motion.div
                    key={area.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setSelectedArea(area)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10">
                        <RiskScoreGauge score={area.score} level={area.risk} size="sm" showLabel={false} animated={false} />
                      </div>
                      <div>
                        <p className="font-medium">{area.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{area.risk} Risk</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SOS Requests */}
        <Card className="glass-card mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-destructive animate-pulse" />
              Active SOS Requests
            </CardTitle>
            <Badge variant="destructive">{sosRequests.filter(s => s.status !== 'resolved').length} Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sosRequests.map((sos) => (
                <motion.div
                  key={sos.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border',
                    sos.priority === 'critical' ? 'border-destructive bg-destructive/10' :
                    sos.priority === 'high' ? 'border-warning bg-warning/10' :
                    'border-border bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                      sos.priority === 'critical' ? 'bg-destructive/20' : 'bg-warning/20'
                    )}>
                      {sos.emergencyType === 'trapped' ? <Users className="w-6 h-6 text-destructive" /> :
                       sos.emergencyType === 'medical' ? <Truck className="w-6 h-6 text-warning" /> :
                       <AlertTriangle className="w-6 h-6 text-warning" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold capitalize">{sos.emergencyType} Emergency</span>
                        <Badge variant={sos.priority === 'critical' ? 'destructive' : 'secondary'} className="uppercase text-xs">
                          {sos.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{sos.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {sos.location.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {sos.peopleCount} people
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round((Date.now() - sos.timestamp) / 60000)} min ago
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {sos.status === 'pending' && (
                      <Button size="sm" onClick={() => handleSOSAction(sos.id, 'acknowledge')}>
                        <Eye className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {sos.status === 'acknowledged' && (
                      <Button size="sm" variant="default" onClick={() => handleSOSAction(sos.id, 'dispatch')}>
                        <Truck className="w-4 h-4 mr-1" />
                        Dispatch
                      </Button>
                    )}
                    {sos.status === 'dispatched' && (
                      <Button size="sm" variant="outline" onClick={() => handleSOSAction(sos.id, 'resolve')}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                    <Badge variant={
                      sos.status === 'pending' ? 'destructive' :
                      sos.status === 'acknowledged' ? 'secondary' :
                      sos.status === 'dispatched' ? 'default' : 'outline'
                    } className="capitalize">
                      {sos.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
