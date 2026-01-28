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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationSearch } from '@/components/LocationSearch';
import { RiskScoreGauge } from '@/components/RiskScoreGauge';
import { RiskBreakdown } from '@/components/RiskBreakdown';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { SOSButton, EmergencyCallButton, SOSModal } from '@/components/SOSButton';
import { EmergencyChatbot } from '@/components/EmergencyChatbot';
import { FloodMap } from '@/components/FloodMap';
import { CrowdReportModal } from '@/components/CrowdReportModal';
import { Location, FloodRiskData } from '@/types/flood';
import { calculateFloodRisk, getSafetyInstructions } from '@/lib/floodRiskCalculator';
import { useWeather } from '@/hooks/useWeather';

const features = [
  { icon: MapPin, title: 'Real-Time Monitoring', desc: 'Live flood status for any location' },
  { icon: AlertTriangle, title: 'Smart Alerts', desc: 'Automatic emergency notifications' },
  { icon: Shield, title: 'Safe Routes', desc: 'AI-powered evacuation guidance' },
  { icon: Users, title: 'Coordinated Response', desc: 'All agencies on one platform' },
];

const emergencyServices = [
  { label: 'Police', number: '100', variant: 'police' as const, icon: <Shield className="w-5 h-5" /> },
  { label: 'Ambulance', number: '108', variant: 'ambulance' as const, icon: <Truck className="w-5 h-5" /> },
  { label: 'Fire & Rescue', number: '101', variant: 'fire' as const, icon: <Flame className="w-5 h-5" /> },
  { label: 'Disaster Helpline', number: '1078', variant: 'default' as const, icon: <Radio className="w-5 h-5" /> },
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
    
    // Simulate elevation and historical data
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
      {/* Emergency Banner */}
      <AnimatePresence>
        {riskData?.level === 'critical' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="emergency-banner text-white px-4 py-3"
          >
            <div className="container mx-auto flex items-center justify-center gap-3">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">CRITICAL FLOOD ALERT: Evacuate immediately to higher ground</span>
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Waves className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">FloodGuard</h1>
              <p className="text-xs text-muted-foreground">Urban Flood Intelligence</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#check" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Check Status</a>
            <a href="#map" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Live Map</a>
            <a href="#emergency" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Emergency</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="hidden sm:flex"
            >
              Authority Login
            </Button>
            <SOSButton onClick={handleSOS} size="sm" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-radial-glow opacity-50" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Real-Time Flood Intelligence</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-primary">Protect</span> Your Community
              <br />
              <span className="text-muted-foreground">From Sudden Floods</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Check flood risk instantly. Get real-time alerts. Access emergency services. 
              <span className="text-foreground font-medium"> No login required for citizens.</span>
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            id="check"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <LocationSearch onLocationSelect={handleLocationSelect} />
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
                className="glass-card rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
              >
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
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
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{instruction}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Map Section */}
      <section id="map" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Live Flood Map</h2>
              <p className="text-muted-foreground">View flood zones, emergency services, and safe routes</p>
            </div>
            <Button
              onClick={() => setShowReportModal(true)}
              variant="outline"
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Flooding
            </Button>
          </div>
          
          <div className="h-[500px] rounded-lg overflow-hidden border border-border">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Emergency Services</h2>
            <p className="text-muted-foreground">One-tap access to emergency responders</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {emergencyServices.map((service) => (
              <EmergencyCallButton
                key={service.number}
                label={service.label}
                number={service.number}
                variant={service.variant}
                icon={service.icon}
                className="w-full"
              />
            ))}
          </div>

          {/* SOS Section */}
          <div className="text-center">
            <p className="text-muted-foreground mb-6">Need immediate help? Send an SOS signal</p>
            <div className="flex justify-center">
              <SOSButton onClick={handleSOS} size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Authority Login CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center glass-card rounded-2xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">For Authorities & Emergency Services</h2>
            <p className="text-muted-foreground mb-6">
              Access dashboards for disaster management, police, hospitals, ambulance, and fire services
            </p>
            <Button onClick={() => navigate('/login')} size="lg" className="bg-gradient-primary">
              Login to Dashboard
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FloodGuard - Urban Flood Intelligence Platform</p>
          <p className="mt-1">Transforming remote sensing data into life-saving action</p>
        </div>
      </footer>

      {/* Chatbot */}
      <EmergencyChatbot location={selectedLocation} riskLevel={riskData?.level} />

      {/* SOS Modal */}
      <SOSModal isOpen={showSOSModal} onClose={() => setShowSOSModal(false)} />

      {/* Crowd Report Modal */}
      <CrowdReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        location={selectedLocation}
      />
    </div>
  );
}
