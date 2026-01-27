import React from 'react';
import { motion } from 'framer-motion';
import {
  Waves,
  Bell,
  Settings,
  LogOut,
  Shield,
  Building2,
  Truck,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthUser, UserRole } from '@/types/flood';

interface DashboardHeaderProps {
  user: AuthUser;
  onSignOut: () => void;
}

const roleIcons: Record<UserRole, React.ElementType> = {
  admin: Shield,
  authority: AlertTriangle,
  police: Shield,
  hospital: Building2,
  ambulance: Truck,
  fire: Flame,
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  authority: 'Disaster Authority',
  police: 'Police',
  hospital: 'Hospital',
  ambulance: 'Ambulance',
  fire: 'Fire & Rescue',
};

export function DashboardHeader({ user, onSignOut }: DashboardHeaderProps) {
  const RoleIcon = roleIcons[user.role] || Shield;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Waves className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">FloodGuard</h1>
            <p className="text-xs text-muted-foreground">{roleLabels[user.role]} Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <RoleIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.department || user.stationName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
