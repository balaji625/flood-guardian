import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Mountain, 
  Droplets,
  Clock,
  Route,
  ChevronRight,
  X,
  Building2,
  Heart,
  Users,
  Tent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Location } from '@/types/flood';
import { EvacuationPoint, RouteType } from '@/types/routing';
import { 
  findNearestEvacuationPoints, 
  calculateDistance,
  getFloodDepthLabel 
} from '@/lib/routeData';

interface SafeRouteNavigationProps {
  currentLocation: Location | null;
  onRouteSelect: (destination: EvacuationPoint, routeType: RouteType) => void;
  onClose: () => void;
  isVisible: boolean;
}

const evacuationPointIcons = {
  shelter: <Tent className="w-5 h-5" />,
  hospital: <Heart className="w-5 h-5" />,
  'high-ground': <Mountain className="w-5 h-5" />,
  'assembly-point': <Users className="w-5 h-5" />,
};

const evacuationPointColors = {
  shelter: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  hospital: 'bg-red-500/20 text-red-400 border-red-500/30',
  'high-ground': 'bg-green-500/20 text-green-400 border-green-500/30',
  'assembly-point': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function SafeRouteNavigation({ 
  currentLocation, 
  onRouteSelect, 
  onClose,
  isVisible 
}: SafeRouteNavigationProps) {
  const [nearbyPoints, setNearbyPoints] = useState<EvacuationPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<EvacuationPoint | null>(null);
  const [routeType, setRouteType] = useState<RouteType>('safe');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentLocation) {
      const points = findNearestEvacuationPoints(
        currentLocation.lat,
        currentLocation.lng,
        6
      );
      setNearbyPoints(points);
    }
  }, [currentLocation]);

  const filteredPoints = nearbyPoints.filter(point =>
    point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    point.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartNavigation = () => {
    if (selectedPoint) {
      onRouteSelect(selectedPoint, routeType);
    }
  };

  const formatDistance = (km?: number) => {
    if (!km) return 'Unknown';
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  const estimateDuration = (km?: number) => {
    if (!km) return 'Unknown';
    // Assume walking speed of 4km/h in emergency conditions
    const hours = km / 4;
    const minutes = Math.round(hours * 60);
    if (minutes < 60) return `~${minutes} min`;
    return `~${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="absolute top-0 left-0 h-full w-80 bg-card/95 backdrop-blur-xl border-r border-border z-50 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Safe Routes</h3>
                  <p className="text-xs text-muted-foreground">Evacuation Navigation</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Route Type Selector */}
            <div className="flex gap-2">
              {(['safe', 'elevated', 'fastest'] as RouteType[]).map((type) => (
                <Button
                  key={type}
                  variant={routeType === type ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 ${routeType === type ? 'bg-primary' : ''}`}
                  onClick={() => setRouteType(type)}
                >
                  {type === 'safe' && <Shield className="w-3 h-3 mr-1" />}
                  {type === 'elevated' && <Mountain className="w-3 h-3 mr-1" />}
                  {type === 'fastest' && <Route className="w-3 h-3 mr-1" />}
                  <span className="capitalize text-xs">{type}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search evacuation points..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Current Location */}
          {currentLocation && (
            <div className="p-3 mx-4 mt-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-medium">Your Location</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {currentLocation.name}
              </p>
            </div>
          )}

          {/* Evacuation Points List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Nearby Safe Zones</h4>
              <Badge variant="outline" className="text-xs">
                {filteredPoints.length} found
              </Badge>
            </div>

            {filteredPoints.map((point) => (
              <motion.div
                key={point.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPoint(point)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedPoint?.id === point.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${evacuationPointColors[point.type]}`}>
                    {evacuationPointIcons[point.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-sm truncate">{point.name}</h5>
                    <p className="text-xs text-muted-foreground capitalize">{point.type.replace('-', ' ')}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <MapPin className="w-3 h-3" />
                        {formatDistance(point.distance)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {estimateDuration(point.distance)}
                      </span>
                    </div>
                    {point.capacity && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Capacity</span>
                          <span>{point.currentOccupancy}/{point.capacity}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (point.currentOccupancy || 0) / point.capacity > 0.8
                                ? 'bg-destructive'
                                : (point.currentOccupancy || 0) / point.capacity > 0.5
                                ? 'bg-warning'
                                : 'bg-success'
                            }`}
                            style={{ width: `${((point.currentOccupancy || 0) / point.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-colors ${
                    selectedPoint?.id === point.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected Point Actions */}
          <AnimatePresence>
            {selectedPoint && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="p-4 border-t border-border bg-card"
              >
                <div className="mb-3">
                  <h4 className="font-semibold">{selectedPoint.name}</h4>
                  {selectedPoint.amenities && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedPoint.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleStartNavigation}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Navigation
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warning Banner */}
          <div className="p-3 bg-warning/10 border-t border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning">
                Flooded roads are blocked. Routes automatically avoid danger zones.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
