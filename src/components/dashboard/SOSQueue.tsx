import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  Clock,
  Eye,
  Truck,
  CheckCircle,
  AlertTriangle,
  Phone,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SOSRequest, UserRole } from '@/types/flood';
import { cn } from '@/lib/utils';

interface SOSQueueProps {
  sosRequests: SOSRequest[];
  userRole: UserRole;
  onAcknowledge: (sosId: string) => void;
  onDispatch: (sosId: string) => void;
  onResolve: (sosId: string) => void;
}

export function SOSQueue({ 
  sosRequests, 
  userRole, 
  onAcknowledge, 
  onDispatch, 
  onResolve 
}: SOSQueueProps) {
  // Filter SOS requests based on role
  const filteredRequests = sosRequests.filter(sos => {
    // All roles see all requests for now; can be filtered by type
    if (userRole === 'admin' || userRole === 'authority') return true;
    if (userRole === 'police') return sos.emergencyType !== 'medical';
    if (userRole === 'hospital' || userRole === 'ambulance') return sos.emergencyType === 'medical' || sos.emergencyType === 'trapped';
    if (userRole === 'fire') return sos.emergencyType === 'fire' || sos.emergencyType === 'trapped';
    return true;
  });

  const activeCount = filteredRequests.filter(s => s.status !== 'resolved').length;

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-destructive animate-pulse" />
          Active SOS Requests
        </CardTitle>
        <Badge variant="destructive">{activeCount} Active</Badge>
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active SOS requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((sos) => (
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
                    <p className="text-sm text-muted-foreground">{sos.description || 'No description'}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
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
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round((Date.now() - sos.timestamp) / 60000)} min ago
                      </span>
                      {sos.contactNumber && (
                        <a href={`tel:${sos.contactNumber}`} className="flex items-center gap-1 text-primary">
                          <Phone className="w-3 h-3" />
                          {sos.contactNumber}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {sos.status === 'pending' && (
                    <Button size="sm" onClick={() => onAcknowledge(sos.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                  {sos.status === 'acknowledged' && (
                    <Button size="sm" variant="default" onClick={() => onDispatch(sos.id)}>
                      <Truck className="w-4 h-4 mr-1" />
                      Dispatch
                    </Button>
                  )}
                  {sos.status === 'dispatched' && (
                    <Button size="sm" variant="outline" onClick={() => onResolve(sos.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolve
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
        )}
      </CardContent>
    </Card>
  );
}
