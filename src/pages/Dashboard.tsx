import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Map,
  LayoutDashboard,
  FileText,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { FloodMap } from '@/components/FloodMap';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { NavigationMap } from '@/components/dashboard/NavigationMap';
import { CrowdReportsList } from '@/components/dashboard/CrowdReportsList';
import { useSOSRequests, useCrowdReports } from '@/hooks/useFirebaseData';
import { SOSRequest } from '@/types/flood';
import { AUTHORITY_CONFIGS, AuthorityType } from '@/types/authority';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { sosRequests, updateSOSStatus } = useSOSRequests();
  const { reports, verifyReport } = useCrowdReports();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSOS, setSelectedSOS] = useState<SOSRequest | null>(null);

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

  const handleNavigateToSOS = (sos: SOSRequest) => {
    // Open Google Maps for navigation
    const url = `https://www.google.com/maps/dir/?api=1&destination=${sos.location.lat},${sos.location.lng}`;
    window.open(url, '_blank');
  };

  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (!user) return null;

  const roleConfig = AUTHORITY_CONFIGS[user.role as AuthorityType];
  const canVerifyReports = roleConfig?.canVerifyReports || 
    ['admin', 'authority', 'police', 'fire', 'hospital'].includes(user.role);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <DashboardHeader user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto bg-muted/50">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Navigate</span>
            </TabsTrigger>
            <TabsTrigger value="liveMap" className="gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Live Map</span>
            </TabsTrigger>
            {canVerifyReports && (
              <TabsTrigger value="reports" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <RoleDashboard
              user={user}
              sosRequests={sosRequests}
              reports={reports}
              onAcknowledge={handleAcknowledge}
              onDispatch={handleDispatch}
              onResolve={handleResolve}
              onNavigate={handleNavigate}
            />
          </TabsContent>

          {/* Navigation Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    Emergency Navigation
                  </span>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {sosRequests.filter(s => s.status !== 'resolved').length} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <NavigationMap
                    user={user}
                    sosRequests={sosRequests}
                    selectedSOS={selectedSOS}
                    onSelectSOS={setSelectedSOS}
                    onNavigateToSOS={handleNavigateToSOS}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Flood Map Tab */}
          <TabsContent value="liveMap" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Live Flood Map
                </CardTitle>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  Live
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] rounded-lg overflow-hidden">
                  <FloodMap 
                    location={user.location ? { 
                      lat: user.location.lat, 
                      lng: user.location.lng, 
                      name: user.stationName || 'Your Station' 
                    } : null} 
                    riskLevel="medium" 
                    showServices 
                    className="h-full" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          {canVerifyReports && (
            <TabsContent value="reports" className="space-y-6">
              <CrowdReportsList
                reports={reports}
                onVerify={handleVerifyReport}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
