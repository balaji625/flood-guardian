import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Building2,
  Truck,
  Flame,
  AlertTriangle,
  Stethoscope,
  Settings,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Users,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthUser, SOSRequest, CrowdReport } from '@/types/flood';
import { AuthorityType, AUTHORITY_CONFIGS } from '@/types/authority';

interface RoleDashboardProps {
  user: AuthUser;
  sosRequests: SOSRequest[];
  reports: CrowdReport[];
  onAcknowledge: (sosId: string) => void;
  onDispatch: (sosId: string) => void;
  onResolve: (sosId: string) => void;
  onNavigate: (lat: number, lng: number) => void;
}

const roleIcons: Record<AuthorityType, React.ElementType> = {
  police: Shield,
  doctor: Stethoscope,
  hospital: Building2,
  fire: Flame,
  ambulance: Truck,
  authority: AlertTriangle,
  admin: Settings,
};

export function RoleDashboard({
  user,
  sosRequests,
  reports,
  onAcknowledge,
  onDispatch,
  onResolve,
  onNavigate
}: RoleDashboardProps) {
  const config = AUTHORITY_CONFIGS[user.role as AuthorityType];
  const RoleIcon = roleIcons[user.role as AuthorityType] || Shield;

  // Filter requests based on status
  const pendingRequests = sosRequests.filter(s => s.status === 'pending');
  const activeRequests = sosRequests.filter(s => s.status === 'acknowledged' || s.status === 'dispatched');
  const resolvedToday = sosRequests.filter(s => 
    s.status === 'resolved' && 
    Date.now() - s.timestamp < 24 * 60 * 60 * 1000
  );

  // Role-specific stats
  const stats = [
    {
      label: 'Pending',
      value: pendingRequests.length,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Active',
      value: activeRequests.length,
      icon: Activity,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Resolved Today',
      value: resolvedToday.length,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Assigned',
      value: sosRequests.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-destructive bg-destructive/10';
      case 'acknowledged': return 'border-warning bg-warning/10';
      case 'dispatched': return 'border-primary bg-primary/10';
      case 'resolved': return 'border-success bg-success/10';
      default: return 'border-border';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Role Header Card */}
      <Card className="glass-card overflow-hidden">
        <div 
          className="h-2" 
          style={{ background: config?.color || 'hsl(var(--primary))' }} 
        />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${config?.color}20` || 'hsl(var(--primary) / 0.2)' }}
              >
                <RoleIcon 
                  className="w-7 h-7" 
                  style={{ color: config?.color || 'hsl(var(--primary))' }} 
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{config?.label || user.role} Dashboard</h2>
                <p className="text-muted-foreground text-sm">
                  {user.stationName || user.department} • {user.name}
                </p>
              </div>
            </div>
            {config?.emergencyNumber && (
              <Badge variant="outline" className="gap-2 py-2">
                <Phone className="w-4 h-4" />
                {config.emergencyNumber}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Requests Queue */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Emergency Queue
            </span>
            <Badge variant="destructive" className="animate-pulse">
              {pendingRequests.length} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sosRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active emergencies in your area</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sosRequests
                .filter(s => s.status !== 'resolved')
                .slice(0, 10)
                .map((sos, index) => (
                  <motion.div
                    key={sos.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(sos.status)} transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPriorityColor(sos.priority)}>
                            {sos.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {sos.emergencyType}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(sos.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-2">
                          {sos.description || `${sos.emergencyType} emergency reported`}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {sos.location.address || `${sos.location.lat.toFixed(4)}, ${sos.location.lng.toFixed(4)}`}
                          </span>
                          {sos.peopleCount && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {sos.peopleCount} people
                            </span>
                          )}
                          {sos.contactNumber && (
                            <a 
                              href={`tel:${sos.contactNumber}`}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              {sos.contactNumber}
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {sos.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => onAcknowledge(sos.id)}
                            className="bg-warning hover:bg-warning/90 text-warning-foreground"
                          >
                            Acknowledge
                          </Button>
                        )}
                        {sos.status === 'acknowledged' && (
                          <Button
                            size="sm"
                            onClick={() => onDispatch(sos.id)}
                            className="bg-primary"
                          >
                            Dispatch
                          </Button>
                        )}
                        {(sos.status === 'acknowledged' || sos.status === 'dispatched') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNavigate(sos.location.lat, sos.location.lng)}
                            className="gap-1"
                          >
                            <Navigation className="w-4 h-4" />
                            Navigate
                          </Button>
                        )}
                        {sos.status === 'dispatched' && (
                          <Button
                            size="sm"
                            onClick={() => onResolve(sos.id)}
                            className="bg-success hover:bg-success/90 text-success-foreground"
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Resolved */}
      {resolvedToday.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Recently Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedToday.slice(0, 5).map((sos) => (
                <div
                  key={sos.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-sm font-medium capitalize">{sos.emergencyType}</p>
                      <p className="text-xs text-muted-foreground">
                        {sos.location.address || 'Unknown location'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(sos.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
