import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Waves, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Phone, 
  Users,
  Building2,
  Truck,
  Flame,
  Radio,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle2,
  FileText,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationSearch } from '@/components/LocationSearch';
import { RiskScoreGauge } from '@/components/RiskScoreGauge';
import { RiskBreakdown } from '@/components/RiskBreakdown';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { SOSButton, EmergencyCallButton, SOSModal } from '@/components/SOSButton';
import { AdvancedChatbot } from '@/components/AdvancedChatbot';
import { FloodMap } from '@/components/FloodMap';
import { CrowdReportModal } from '@/components/CrowdReportModal';
import { GovtHeader, GovtFooter } from '@/components/GovtHeader';
import { EmergencyAlertBanner } from '@/components/EmergencyAlertBanner';
import { WaterLevelTrends } from '@/components/WaterLevelTrends';
import { FamilySafetyCheck } from '@/components/FamilySafetyCheck';
import { NearbySheltersFinder } from '@/components/NearbySheltersFinder';
import { LanguageSelector } from '@/components/LanguageSelector';
import { WeatherAlerts } from '@/components/WeatherAlerts';
import { EmergencyContacts } from '@/components/EmergencyContacts';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { FloatingQuickActions } from '@/components/FloatingQuickActions';
import { Location, FloodRiskData } from '@/types/flood';
import { calculateFloodRisk, getSafetyInstructions } from '@/lib/floodRiskCalculator';
import { useWeather } from '@/hooks/useWeather';

const features = [
  { 
    icon: MapPin, 
    title: 'Real-Time Monitoring', 
    desc: 'Live flood status with satellite data',
    color: 'text-primary'
  },
  { 
    icon: AlertTriangle, 
    title: 'Smart Alerts', 
    desc: 'Automatic emergency notifications',
    color: 'text-warning'
  },
  { 
    icon: Shield, 
    title: 'Safe Routes', 
    desc: 'AI-powered evacuation guidance',
    color: 'text-success'
  },
  { 
    icon: Users, 
    title: 'Coordinated Response', 
    desc: 'All agencies on one platform',
    color: 'text-accent'
  },
];

const emergencyServices = [
  { label: 'Police Control', number: '100', variant: 'police' as const, icon: <Shield className="w-5 h-5" />, desc: 'Law enforcement' },
  { label: 'Medical Emergency', number: '108', variant: 'ambulance' as const, icon: <Truck className="w-5 h-5" />, desc: 'Ambulance service' },
  { label: 'Fire & Rescue', number: '101', variant: 'fire' as const, icon: <Flame className="w-5 h-5" />, desc: 'Fire department' },
  { label: 'Disaster Helpline', number: '1078', variant: 'default' as const, icon: <Radio className="w-5 h-5" />, desc: 'NDMA helpline' },
];

const stats = [
  { value: '24/7', label: 'Monitoring', icon: Clock },
  { value: '100+', label: 'Agencies Connected', icon: Building2 },
  { value: '<5min', label: 'Response Time', icon: Zap },
  { value: '50K+', label: 'Alerts Sent', icon: Bell },
];

export default function Index() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [riskData, setRiskData] = useState<FloodRiskData | null>(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { weather, fetchWeather } = useWeather();

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    await fetchWeather(location.lat, location.lng);
    
    const elevation = Math.floor(Math.random() * 50) + 5;
    const historicalProbability = Math.random() * 0.7 + 0.1;
    const rainfall = weather?.rainfall || Math.floor(Math.random() * 80) + 10;
    
    const risk = calculateFloodRisk(rainfall, elevation, historicalProbability);
    setRiskData(risk);
  };

  const handleSOS = () => {
    setShowSOSModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Emergency Alert Banner - Scrolling announcements */}
      <EmergencyAlertBanner />

      {/* Government Header */}
      <GovtHeader showEmergencyBanner={riskData?.level === 'critical'} />

      {/* Main Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Waves className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">FloodGuard</h1>
              <p className="text-xs text-muted-foreground">Urban Flood Intelligence System</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#check" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Check Risk</a>
            <a href="#map" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Live Map</a>
            <a href="#emergency" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Emergency</a>
          </nav>

          <div className="flex items-center gap-2">
            <OfflineIndicator />
            <LanguageSelector variant="compact" />
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="hidden sm:flex gap-2"
            >
              <Building2 className="w-4 h-4" />
              Authority Portal
            </Button>
            <SOSButton onClick={handleSOS} size="sm" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-40" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            {/* Official Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Official Government Platform</span>
              <Badge variant="secondary" className="text-[10px] py-0">LIVE</Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gradient-primary">Real-Time</span> Flood
              <br />
              <span className="text-foreground">Intelligence System</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Check flood risk instantly. Receive real-time alerts. Access emergency services.
              <span className="text-foreground font-medium block mt-1">No registration required for citizens.</span>
            </p>

            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-2 text-sm"
                >
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="font-bold">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search Box */}
          <motion.div
            id="check"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            {/* Allow LocationSearch dropdown to render outside the card */}
            <div className="official-card p-1 overflow-visible">
              <LocationSearch onLocationSelect={handleLocationSelect} />
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="glass-card rounded-xl p-5 text-center hover:border-primary/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-card mx-auto mb-3 flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Risk Display Section */}
      <AnimatePresence>
        {selectedLocation && riskData && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-12 bg-card/50 border-y border-border"
          >
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Risk Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center"
                >
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {selectedLocation.name}
                  </h2>
                  <RiskScoreGauge score={riskData.score} level={riskData.level} size="lg" />
                </motion.div>

                {/* Risk Breakdown */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-xl p-6"
                >
                  <RiskBreakdown data={riskData} />
                </motion.div>

                {/* Weather & Instructions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-xl p-6"
                >
                  {weather && <WeatherDisplay weather={weather} />}
                </motion.div>
              </div>

              {/* Safety Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 glass-card rounded-xl p-6"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Safety Instructions
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {getSafetyInstructions(riskData.level).map((instruction, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{instruction}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Weather Alerts Section */}
      <section className="py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <WeatherAlerts location={selectedLocation} className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* NEW: Live Intelligence Section - Water Trends, Family Safety, Shelters */}
      <section id="shelters" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3">
              <Zap className="w-3 h-3 mr-1" /> Live Intelligence
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Real-Time Safety Tools</h2>
            <p className="text-muted-foreground">Stay informed and keep your family safe</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Water Level Trends Chart */}
            <WaterLevelTrends 
              locationName={selectedLocation?.name || 'Mumbai Region'} 
              className="lg:col-span-1"
            />

            {/* Family Safety Check */}
            <FamilySafetyCheck 
              currentLocation={selectedLocation}
              className="lg:col-span-1"
            />

            {/* Nearby Shelters Finder */}
            <NearbySheltersFinder 
              currentLocation={selectedLocation}
              className="lg:col-span-1"
            />
          </div>

          {/* Emergency Contacts */}
          <div className="mt-6 max-w-md mx-auto lg:max-w-none lg:grid lg:grid-cols-2 gap-6">
            <EmergencyContacts className="lg:col-span-1" />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Live Flood Intelligence Map</h2>
              <p className="text-muted-foreground">View flood zones, emergency services, shelters, and safe evacuation routes</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowReportModal(true)}
                variant="outline"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Report Flooding
              </Button>
            </div>
          </div>
          
          <div className="h-[500px] rounded-xl overflow-hidden border-2 border-border shadow-elevated">
            <FloodMap 
              location={selectedLocation} 
              riskLevel={riskData?.level || 'low'} 
              showServices 
              className="h-full w-full" 
            />
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section id="emergency" className="py-16 bg-card/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Phone className="w-3 h-3 mr-1" /> 24/7 Available
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Emergency Services</h2>
            <p className="text-muted-foreground">One-tap access to all emergency responders</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            {emergencyServices.map((service) => (
              <motion.div
                key={service.number}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="official-card p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {service.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{service.label}</p>
                    <p className="text-xs text-muted-foreground">{service.desc}</p>
                  </div>
                </div>
                <EmergencyCallButton
                  label=""
                  number={service.number}
                  variant={service.variant}
                  className="w-full justify-center"
                />
              </motion.div>
            ))}
          </div>

          {/* SOS Section */}
          <div className="text-center max-w-md mx-auto">
            <div className="glass-card rounded-2xl p-8">
              <p className="text-muted-foreground mb-6">
                Need immediate help? Send an SOS signal to alert all nearby emergency responders.
              </p>
              <div className="flex justify-center">
                <SOSButton onClick={handleSOS} size="lg" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Your location will be shared with emergency services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Authority Login CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center official-card">
            <div className="official-card-header">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-lg">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">Authority & Emergency Services Portal</h2>
              <p className="text-muted-foreground mb-6">
                Access role-specific dashboards for Police, Hospitals, Fire & Rescue, 
                Ambulance Services, and Disaster Management authorities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/login')} size="lg" className="bg-gradient-primary gap-2">
                  <Shield className="w-5 h-5" />
                  Authority Login
                </Button>
                <Button onClick={() => navigate('/register')} size="lg" variant="outline" className="gap-2">
                  <FileText className="w-5 h-5" />
                  Register Authority
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <GovtFooter />

      {/* Advanced Chatbot */}
      <AdvancedChatbot 
        location={selectedLocation} 
        riskLevel={riskData?.level} 
        onTriggerSOS={handleSOS}
        onTriggerReport={() => setShowReportModal(true)}
      />

      {/* SOS Modal */}
      <SOSModal isOpen={showSOSModal} onClose={() => setShowSOSModal(false)} />

      {/* Crowd Report Modal */}
      <CrowdReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        location={selectedLocation}
      />

      {/* Floating Quick Actions */}
      <FloatingQuickActions onSOSClick={handleSOS} />
    </div>
  );
}
