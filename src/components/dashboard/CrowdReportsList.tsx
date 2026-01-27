import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  CheckCircle,
  Droplets,
  Image,
  Phone,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CrowdReport } from '@/types/flood';
import { cn } from '@/lib/utils';

interface CrowdReportsListProps {
  reports: CrowdReport[];
  onVerify: (reportId: string, verified: boolean) => void;
}

const waterLevelLabels: Record<string, { label: string; color: string }> = {
  ankle: { label: 'Ankle Deep', color: 'bg-yellow-500/20 text-yellow-500' },
  knee: { label: 'Knee Deep', color: 'bg-orange-500/20 text-orange-500' },
  waist: { label: 'Waist Deep', color: 'bg-red-500/20 text-red-500' },
  chest: { label: 'Chest Deep', color: 'bg-red-600/20 text-red-600' },
  above: { label: 'Impassable', color: 'bg-red-700/20 text-red-700' },
};

export function CrowdReportsList({ reports, onVerify }: CrowdReportsListProps) {
  const unverifiedCount = reports.filter(r => !r.verified).length;

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-primary" />
          Citizen Flood Reports
        </CardTitle>
        <Badge variant="secondary">{unverifiedCount} Unverified</Badge>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No flood reports yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {reports.map((report) => {
              const levelInfo = waterLevelLabels[report.waterLevel] || { label: report.waterLevel, color: 'bg-muted' };
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-4 rounded-lg border',
                    report.verified ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={levelInfo.color}>
                          {levelInfo.label}
                        </Badge>
                        {report.verified && (
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {report.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </span>
                        {report.reporterContact && (
                          <a href={`tel:${report.reporterContact}`} className="flex items-center gap-1 text-primary">
                            <Phone className="w-3 h-3" />
                            Contact
                          </a>
                        )}
                        {report.imageUrl && (
                          <span className="flex items-center gap-1 text-primary">
                            <Image className="w-3 h-3" />
                            Has Photo
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!report.verified && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                          onClick={() => onVerify(report.id, true)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => onVerify(report.id, false)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
