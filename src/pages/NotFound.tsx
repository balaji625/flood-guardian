import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyCallButton } from '@/components/SOSButton';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-radial-glow opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-warning" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist. If this is an emergency, use the contact options below.
        </p>

        <div className="space-y-4">
          <Button onClick={() => navigate('/')} className="w-full" size="lg">
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <EmergencyCallButton
              label="Emergency"
              number="112"
              variant="ambulance"
              icon={<Phone className="w-4 h-4" />}
            />
            <Button variant="outline" onClick={() => navigate('/login')}>
              <MapPin className="w-4 h-4 mr-2" />
              Authority Login
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
