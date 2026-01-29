import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ExternalLink } from 'lucide-react';

interface GovtHeaderProps {
  showEmergencyBanner?: boolean;
}

export function GovtHeader({ showEmergencyBanner }: GovtHeaderProps) {
  return (
    <>
      {/* Official Government Banner */}
      <div className="govt-header">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Official Emergency Response System • Government of India</span>
        </div>
      </div>

      {/* Emergency Alert Banner (conditional) */}
      {showEmergencyBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-gradient-danger text-white py-2 px-4"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <span className="animate-pulse">⚠️</span>
            <span className="font-medium text-sm">FLOOD ALERT ACTIVE: Multiple areas reporting high water levels</span>
            <span className="animate-pulse">⚠️</span>
          </div>
        </motion.div>
      )}
    </>
  );
}

export function GovtFooter() {
  return (
    <footer className="py-8 border-t border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              FloodGuard
            </h4>
            <p className="text-sm text-muted-foreground">
              Official Urban Flood Intelligence Platform. Transforming remote sensing data 
              into life-saving action for disaster management.
            </p>
          </div>

          {/* Emergency Numbers */}
          <div>
            <h4 className="font-semibold mb-3">Emergency Numbers</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Police:</span>
                <a href="tel:100" className="text-primary hover:underline font-mono">100</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Ambulance:</span>
                <a href="tel:108" className="text-primary hover:underline font-mono">108</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Fire:</span>
                <a href="tel:101" className="text-primary hover:underline font-mono">101</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Disaster:</span>
                <a href="tel:1078" className="text-primary hover:underline font-mono">1078</a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="#check" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                Check Flood Risk
              </a>
              <a href="#map" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                Live Flood Map
              </a>
              <a href="#emergency" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                Emergency Services
              </a>
              <a href="/login" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                Authority Login <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FloodGuard - Urban Flood Intelligence Platform</p>
          <p className="mt-1 text-xs">
            National Disaster Management Authority • Ministry of Home Affairs • Government of India
          </p>
        </div>
      </div>
    </footer>
  );
}