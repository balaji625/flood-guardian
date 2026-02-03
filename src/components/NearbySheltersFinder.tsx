import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Users, 
  ChevronRight,
  Hospital,
  Shield,
  Truck,
  Home,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Shelter {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'police' | 'fire' | 'relief';
  address: string;
  distance: number; // in km
  capacity?: number;
  occupancy?: number;
  phone?: string;
  isOpen: boolean;
  lat: number;
  lng: number;
  facilities?: string[];
}

interface NearbySheltersFinderProps {
  className?: string;
  currentLocation?: { name: string; lat: number; lng: number } | null;
}

// Demo shelters data for India
const DEMO_SHELTERS: Shelter[] = [
  {
    id: '1',
    name: 'Municipal Relief Camp - Andheri',
    type: 'shelter',
    address: 'Andheri Sports Complex, Andheri West',
    distance: 1.2,
    capacity: 500,
    occupancy: 120,
    phone: '022-26281234',
    isOpen: true,
    lat: 19.1196,
    lng: 72.8464,
    facilities: ['Food', 'Water', 'Medical', 'Bedding'],
  },
  {
    id: '2',
    name: 'KEM Hospital Emergency',
    type: 'hospital',
    address: 'Acharya Donde Marg, Parel',
    distance: 2.5,
    phone: '022-24136051',
    isOpen: true,
    lat: 19.0044,
    lng: 72.8422,
    facilities: ['Emergency Care', 'ICU', 'Ambulance'],
  },
  {
    id: '3',
    name: 'Bandra Police Station',
    type: 'police',
    address: 'Hill Road, Bandra West',
    distance: 1.8,
    phone: '100',
    isOpen: true,
    lat: 19.0544,
    lng: 72.8252,
  },
  {
    id: '4',
    name: 'Fire Brigade - Dadar',
    type: 'fire',
    address: 'Senapati Bapat Marg, Dadar',
    distance: 3.2,
    phone: '101',
    isOpen: true,
    lat: 19.0178,
    lng: 72.8478,
  },
  {
    id: '5',
    name: 'NDRF Relief Center',
    type: 'relief',
    address: 'BKC Ground, Bandra Kurla Complex',
    distance: 2.8,
    capacity: 1000,
    occupancy: 350,
    phone: '011-26107953',
    isOpen: true,
    lat: 19.0596,
    lng: 72.8656,
    facilities: ['Food', 'Water', 'Rescue', 'First Aid'],
  },
  {
    id: '6',
    name: 'Community Shelter - Kurla',
    type: 'shelter',
    address: 'Kurla Community Hall, Kurla East',
    distance: 4.1,
    capacity: 300,
    occupancy: 280,
    phone: '022-25221234',
    isOpen: true,
    lat: 19.0726,
    lng: 72.8796,
    facilities: ['Food', 'Water', 'Bedding'],
  },
  {
    id: '7',
    name: 'Lilavati Hospital',
    type: 'hospital',
    address: 'A-791, Bandra Reclamation',
    distance: 2.1,
    phone: '022-26568000',
    isOpen: true,
    lat: 19.0509,
    lng: 72.8296,
    facilities: ['Emergency Care', 'Trauma Center'],
  },
];

const TYPE_CONFIG = {
  shelter: { icon: Home, label: 'Shelters', color: 'text-primary' },
  hospital: { icon: Hospital, label: 'Hospitals', color: 'text-destructive' },
  police: { icon: Shield, label: 'Police', color: 'text-blue-500' },
  fire: { icon: Truck, label: 'Fire', color: 'text-orange-500' },
  relief: { icon: Building2, label: 'Relief', color: 'text-success' },
};

export function NearbySheltersFinder({ className, currentLocation }: NearbySheltersFinderProps) {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  // Simulate fetching shelters
  useEffect(() => {
    setIsLoading(true);
    // In production, fetch from Firebase/API based on location
    const timer = setTimeout(() => {
      setShelters(DEMO_SHELTERS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentLocation]);

  const filteredShelters = useMemo(() => {
    if (activeTab === 'all') return shelters;
    return shelters.filter(s => s.type === activeTab);
  }, [shelters, activeTab]);

  const handleNavigate = (shelter: Shelter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`;
    window.open(url, '_blank');
    toast.success(`Opening directions to ${shelter.name}`);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getOccupancyStatus = (shelter: Shelter) => {
    if (!shelter.capacity || !shelter.occupancy) return null;
    const percentage = (shelter.occupancy / shelter.capacity) * 100;
    if (percentage >= 90) return { label: 'Almost Full', color: 'destructive' };
    if (percentage >= 70) return { label: 'Filling Up', color: 'warning' };
    return { label: 'Available', color: 'success' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card rounded-xl overflow-hidden', className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Nearby Emergency Services</h3>
              <p className="text-xs text-muted-foreground">
                Shelters, hospitals & relief centers
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <MapPin className="w-3 h-3" />
            {shelters.length} Found
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid grid-cols-4 w-full h-auto p-1">
          <TabsTrigger value="all" className="text-xs py-1.5">All</TabsTrigger>
          <TabsTrigger value="shelter" className="text-xs py-1.5">Shelters</TabsTrigger>
          <TabsTrigger value="hospital" className="text-xs py-1.5">Medical</TabsTrigger>
          <TabsTrigger value="relief" className="text-xs py-1.5">Relief</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredShelters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No {activeTab === 'all' ? 'services' : activeTab + 's'} found nearby</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredShelters.map((shelter) => {
              const config = TYPE_CONFIG[shelter.type];
              const occupancyStatus = getOccupancyStatus(shelter);
              const Icon = config.icon;

              return (
                <motion.div
                  key={shelter.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                      shelter.isOpen ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm truncate">{shelter.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{shelter.address}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {shelter.distance} km
                        </Badge>
                      </div>

                      {/* Status & Capacity */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge 
                          variant={shelter.isOpen ? 'default' : 'secondary'}
                          className={cn('text-xs', shelter.isOpen && 'bg-success')}
                        >
                          {shelter.isOpen ? 'Open' : 'Closed'}
                        </Badge>
                        
                        {occupancyStatus && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              occupancyStatus.color === 'destructive' && 'border-destructive/50 text-destructive',
                              occupancyStatus.color === 'warning' && 'border-warning/50 text-warning',
                              occupancyStatus.color === 'success' && 'border-success/50 text-success',
                            )}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {shelter.occupancy}/{shelter.capacity} - {occupancyStatus.label}
                          </Badge>
                        )}
                      </div>

                      {/* Facilities */}
                      {shelter.facilities && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {shelter.facilities.slice(0, 3).map((facility) => (
                            <span 
                              key={facility}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground"
                            >
                              {facility}
                            </span>
                          ))}
                          {shelter.facilities.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                              +{shelter.facilities.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs flex-1 gap-1"
                          onClick={() => handleNavigate(shelter)}
                        >
                          <Navigation className="w-3 h-3" />
                          Directions
                        </Button>
                        {shelter.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleCall(shelter.phone!)}
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <p className="text-xs text-muted-foreground text-center">
          Tap "Directions" to open Google Maps navigation
        </p>
      </div>
    </motion.div>
  );
}
