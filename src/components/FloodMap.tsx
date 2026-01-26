import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, RiskLevel, EmergencyService } from '@/types/flood';
import { getRiskColor } from '@/lib/floodRiskCalculator';
import { RouteLayer } from './RouteLayer';
import { EvacuationPoint, RouteType } from '@/types/routing';
import { EVACUATION_POINTS, findNearestEvacuationPoints } from '@/lib/routeData';
import { Button } from '@/components/ui/button';
import { Navigation, Layers, X, Mountain, AlertTriangle, MapPin } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const serviceIcons: Record<string, L.DivIcon> = {
  hospital: createCustomIcon('#ef4444'),
  police: createCustomIcon('#3b82f6'),
  fire: createCustomIcon('#f97316'),
  ambulance: createCustomIcon('#22c55e'),
  shelter: createCustomIcon('#8b5cf6'),
};

// Sample emergency services
const SAMPLE_SERVICES: EmergencyService[] = [
  { id: '1', name: 'City General Hospital', type: 'hospital', location: { lat: 19.076, lng: 72.8777 }, address: 'Mumbai Central', phone: '022-23456789', available: true },
  { id: '2', name: 'Police Station - Central', type: 'police', location: { lat: 19.08, lng: 72.88 }, address: 'CST Area', phone: '100', available: true },
  { id: '3', name: 'Fire Station No. 1', type: 'fire', location: { lat: 19.07, lng: 72.87 }, address: 'Fort Area', phone: '101', available: true },
  { id: '4', name: 'Ambulance Depot', type: 'ambulance', location: { lat: 19.075, lng: 72.875 }, address: 'Near Hospital', phone: '108', available: true },
  { id: '5', name: 'Flood Relief Shelter', type: 'shelter', location: { lat: 19.082, lng: 72.872 }, address: 'Community Hall', phone: '1078', available: true, capacity: 500 },
];

interface MapUpdaterProps {
  location: Location;
}

function MapUpdater({ location }: MapUpdaterProps) {
  const map = useMap();
  
  useEffect(() => {
    if (map && location) {
      map.setView([location.lat, location.lng], 13);
    }
  }, [location, map]);
  
  return null;
}

interface FloodMapProps {
  location: Location | null;
  riskLevel?: RiskLevel;
  showServices?: boolean;
  className?: string;
}

export function FloodMap({ location, riskLevel = 'low', showServices = true, className }: FloodMapProps) {
  const defaultLocation = { lat: 19.076, lng: 72.8777 };
  const center = location || defaultLocation;
  
  // State for safe route navigation
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [showFloodedRoads, setShowFloodedRoads] = useState(true);
  const [showElevatedPaths, setShowElevatedPaths] = useState(true);
  const [showEvacuationPoints, setShowEvacuationPoints] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<EvacuationPoint | null>(null);
  const [routeType, setRouteType] = useState<RouteType>('safe');
  const [isNavigating, setIsNavigating] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  // Get nearby evacuation points
  const nearbyPoints = useMemo(() => {
    return location 
      ? findNearestEvacuationPoints(location.lat, location.lng, 6)
      : EVACUATION_POINTS;
  }, [location]);

  const startNavigation = (point: EvacuationPoint) => {
    setSelectedDestination(point);
    setIsNavigating(true);
    setShowRoutePanel(false);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setSelectedDestination(null);
  };

  return (
    <div className={`relative ${className || ''}`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="sm"
          variant={showRoutePanel ? "default" : "secondary"}
          onClick={() => {
            setShowRoutePanel(!showRoutePanel);
            setShowLayersPanel(false);
          }}
          className="gap-2 shadow-lg"
        >
          <Navigation className="w-4 h-4" />
          Safe Routes
        </Button>
        <Button
          size="sm"
          variant={showLayersPanel ? "default" : "secondary"}
          onClick={() => {
            setShowLayersPanel(!showLayersPanel);
            setShowRoutePanel(false);
          }}
          className="gap-2 shadow-lg"
        >
          <Layers className="w-4 h-4" />
          Layers
        </Button>
      </div>

      {/* Layers Panel */}
      {showLayersPanel && (
        <div className="absolute top-20 right-4 z-[1000] bg-card border border-border rounded-lg p-4 shadow-xl w-56">
          <h4 className="font-semibold mb-3 text-sm">Map Layers</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showFloodedRoads}
                onChange={(e) => setShowFloodedRoads(e.target.checked)}
                className="rounded"
              />
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Flooded Roads
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showElevatedPaths}
                onChange={(e) => setShowElevatedPaths(e.target.checked)}
                className="rounded"
              />
              <Mountain className="w-4 h-4 text-emerald-500" />
              Elevated Paths
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showEvacuationPoints}
                onChange={(e) => setShowEvacuationPoints(e.target.checked)}
                className="rounded"
              />
              <MapPin className="w-4 h-4 text-primary" />
              Evacuation Points
            </label>
          </div>
        </div>
      )}

      {/* Safe Routes Panel */}
      {showRoutePanel && (
        <div className="absolute top-20 right-4 z-[1000] bg-card border border-border rounded-lg p-4 shadow-xl w-72 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Evacuation Points</h4>
            <Button size="icon" variant="ghost" onClick={() => setShowRoutePanel(false)} className="h-6 w-6">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Route Type Selection */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Route Preference:</p>
            <div className="flex gap-1">
              {(['safe', 'elevated', 'fastest'] as RouteType[]).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={routeType === type ? "default" : "outline"}
                  onClick={() => setRouteType(type)}
                  className="flex-1 text-xs capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Evacuation Points List */}
          <div className="space-y-2">
            {nearbyPoints.map((point) => (
              <div
                key={point.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedDestination?.id === point.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => startNavigation(point)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{point.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{point.type.replace('-', ' ')}</p>
                    {point.distance && (
                      <p className="text-xs text-primary mt-1">{point.distance.toFixed(1)} km away</p>
                    )}
                  </div>
                  {point.capacity && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {point.currentOccupancy || 0}/{point.capacity}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Navigation Banner */}
      {isNavigating && selectedDestination && (
        <div className="absolute top-4 left-4 right-20 z-[1000] bg-primary text-primary-foreground rounded-lg p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Navigating to</p>
              <p className="font-semibold">{selectedDestination.name}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={stopNavigation}>
              End Navigation
            </Button>
          </div>
        </div>
      )}

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {location && <MapUpdater location={location} />}
        
        {/* Route Layer with all safe navigation features */}
        <RouteLayer
          currentLocation={location}
          destination={selectedDestination}
          routeType={routeType}
          showFloodedRoads={showFloodedRoads}
          showElevatedPaths={showElevatedPaths}
          showEvacuationPoints={showEvacuationPoints}
          isNavigating={isNavigating}
        />
        
        {/* Risk zone circle */}
        {location && (
          <Circle
            center={[location.lat, location.lng]}
            radius={2000}
            pathOptions={{
              color: getRiskColor(riskLevel),
              fillColor: getRiskColor(riskLevel),
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        )}
        
        {/* Location marker */}
        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div className="text-center">
                <strong>{location.name}</strong>
                <br />
                <span className="text-sm">Your Location</span>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Emergency services */}
        {showServices && SAMPLE_SERVICES.map((service) => (
          <Marker
            key={service.id}
            position={[service.location.lat, service.location.lng]}
            icon={serviceIcons[service.type]}
          >
            <Popup>
              <div className="min-w-[150px]">
                <strong>{service.name}</strong>
                <br />
                <span className="text-sm text-muted-foreground">{service.address}</span>
                <br />
                <a href={`tel:${service.phone}`} className="text-primary font-semibold">
                  📞 {service.phone}
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
