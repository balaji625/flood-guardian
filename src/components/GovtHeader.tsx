import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ExternalLink, Sparkles, Zap, Heart } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface GovtHeaderProps {
  showEmergencyBanner?: boolean;
}

export function GovtHeader({ showEmergencyBanner }: GovtHeaderProps) {
  return (
    <>
      {/* Official Government Banner - Vibrant gradient */}
      <div className="govt-header relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-transparent to-fuchsia-600/20" />
        <div className="container mx-auto flex items-center justify-center gap-2 relative">
          <Sparkles className="w-4 h-4" />
          <span>Official Emergency Response System • Government of India</span>
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Theme toggle (Official default) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <ThemeToggle />
        </div>
      </div>

      {/* Emergency Alert Banner (conditional) */}
      {showEmergencyBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="emergency-banner text-white py-2 px-4"
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
    <footer className="py-10 border-t border-primary/20 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />
      <div className="absolute inset-0 bg-radial-glow opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-gradient-primary">FloodGuard</span>
            </h4>
            <p className="text-sm text-muted-foreground">
              Official Urban Flood Intelligence Platform. Transforming remote sensing data 
              into life-saving action for disaster management.
            </p>
          </div>

          {/* Emergency Numbers */}
          <div>
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              Emergency Numbers
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-primary/10">
                <span className="text-muted-foreground">Police:</span>
                <a href="tel:100" className="text-primary hover:underline font-mono font-bold">100</a>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-primary/10">
                <span className="text-muted-foreground">Ambulance:</span>
                <a href="tel:108" className="text-primary hover:underline font-mono font-bold">108</a>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-primary/10">
                <span className="text-muted-foreground">Fire:</span>
                <a href="tel:101" className="text-primary hover:underline font-mono font-bold">101</a>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-primary/10">
                <span className="text-muted-foreground">Disaster:</span>
                <a href="tel:1078" className="text-primary hover:underline font-mono font-bold">1078</a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="#check" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Check Flood Risk
              </a>
              <a href="#map" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Live Flood Map
              </a>
              <a href="#emergency" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                Emergency Services
              </a>
              <a href="/login" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Authority Login <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-primary/10 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FloodGuard - Urban Flood Intelligence Platform
          </p>
          <p className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-destructive" /> for National Disaster Management Authority • Ministry of Home Affairs • Government of India
          </p>
        </div>
      </div>
    </footer>
  );
}