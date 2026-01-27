import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  Users,
  Phone,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { FloodMap } from '@/components/FloodMap';
import { RiskScoreGauge } from '@/components/RiskScoreGauge';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { SOSQueue } from '@/components/dashboard/SOSQueue';
import { CrowdReportsList } from '@/components/dashboard/CrowdReportsList';
import { useSOSRequests, useCrowdReports } from '@/hooks/useFirebaseData';
import { RiskLevel } from '@/types/flood';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { sosRequests, updateSOSStatus } = useSOSRequests();
  const { reports, verifyReport } = useCrowdReports();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAcknowledge = (sosId: string) => {
    updateSOSStatus(sosId, 'acknowledged', user?.uid);
  };

  const handleDispatch = (sosId: string) => {
    updateSOSStatus(sosId, 'dispatched', user?.uid);
  };

  const handleResolve = (sosId: string) => {
    updateSOSStatus(sosId, 'resolved');
  };

  const handleVerifyReport = (reportId: string, verified: boolean) => {
    verifyReport(reportId, verified);
  };

  if (!user) return null;

  // Calculate stats from real data
  const activeAlerts = reports.filter(r => !r.verified && (r.waterLevel === 'chest' || r.waterLevel === 'above')).length;
  const activeSOS = sosRequests.filter(s => s.status !== 'resolved').length;
  const resolvedToday = sosRequests.filter(s => 
    s.status === 'resolved' && 
    Date.now() - s.timestamp < 24 * 60 * 60 * 1000
  ).length;

  const stats = [
    { label: 'Active Alerts', value: activeAlerts.toString(), icon: AlertTriangle, change: 'Critical reports', color: 'text-destructive' },
    { label: 'SOS Requests', value: activeSOS.toString(), icon: Phone, change: 'Pending response', color: 'text-warning' },
    { label: 'Resolved Today', value: resolvedToday.toString(), icon: Users, change: 'Emergencies handled', color: 'text-success' },
    { label: 'Areas Monitored', value: reports.length.toString(), icon: MapPin, change: 'Crowd reports', color: 'text-primary' },
  ];

  // Sample area risks for overview
  const areaRisks: { name: string; risk: RiskLevel; score: number }[] = [
    { name: 'Mumbai Central', risk: 'high', score: 78 },
    { name: 'Andheri East', risk: 'critical', score: 92 },
    { name: 'Bandra West', risk: 'medium', score: 45 },
    { name: 'Powai', risk: 'low', score: 22 },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <DashboardHeader user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="mb-6">
          <StatsGrid stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Live Flood Map
                </CardTitle>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  Live
                </Badge>
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
                {areaRisks.map((area) => (
                  <motion.div
                    key={area.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
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

        {/* SOS Queue */}
        <div className="mb-6">
          <SOSQueue
            sosRequests={sosRequests}
            userRole={user.role}
            onAcknowledge={handleAcknowledge}
            onDispatch={handleDispatch}
            onResolve={handleResolve}
          />
        </div>

        {/* Crowd Reports - Only for admin/authority roles */}
        {(user.role === 'admin' || user.role === 'authority') && (
          <CrowdReportsList
            reports={reports}
            onVerify={handleVerifyReport}
          />
        )}
      </main>
    </div>
  );
}
