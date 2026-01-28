import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SOSRequest } from '@/types/flood';
import { AuthUser } from '@/types/flood';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color: string, pulse: boolean = false) => {
  const pulseClass = pulse ? 'animate-ping' : '';
  return L.divIcon({
    html: `
      <div class="relative">
        ${pulse ? '<div class="absolute inset-0 rounded-full bg-red-500 opacity-50 animate-ping"></div>' : ''}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
          <path fill="${color}" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const sosIcon = createIcon('#ef4444', true);
const stationIcon = createIcon('#3b82f6');
const userIcon = createIcon('#22c55e');

interface MapCenterProps {
  center: [number, number];
  zoom?: number;
}

function MapCenter({ center, zoom = 14 }: MapCenterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface NavigationMapProps {
  user: AuthUser;
  sosRequests: SOSRequest[];
  selectedSOS: SOSRequest | null;
  onSelectSOS: (sos: SOSRequest | null) => void;
  onNavigateToSOS: (sos: SOSRequest) => void;
}

export function NavigationMap({ 
  user, 
  sosRequests, 
  selectedSOS, 
  onSelectSOS,
  onNavigateToSOS 
}: NavigationMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeLine, setRouteLine] = useState<[number, number][]>([]);

  // Get user's current location
  useEffect(() => {
    if (user.location) {
      setUserLocation([user.location.lat, user.location.lng]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation([19.076, 72.877]) // Default to Mumbai
      );
    }
  }, [user.location]);

  // Calculate route when SOS is selected
  useEffect(() => {
    if (selectedSOS && userLocation) {
      // Simple straight line for now (in production, use routing API)
      setRouteLine([
        userLocation,
        [selectedSOS.location.lat, selectedSOS.location.lng]
      ]);
    } else {
      setRouteLine([]);
    }
  }, [selectedSOS, userLocation]);

  const center: [number, number] = selectedSOS 
    ? [selectedSOS.location.lat, selectedSOS.location.lng]
    : userLocation || [19.076, 72.877];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Map */}
      <div className="flex-1 rounded-lg overflow-hidden border border-border relative">
        <MapContainer
          center={center}
          zoom={13}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapCenter center={center} />

          {/* Route line */}
          {routeLine.length > 0 && (
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: '#3b82f6',
                weight: 4,
                dashArray: '10, 10',
              }}
            />
          )}

          {/* User/Station location */}
          {userLocation && (
            <Marker position={userLocation} icon={stationIcon}>
              <Popup>
                <div className="text-center p-1">
                  <strong>{user.stationName || 'Your Location'}</strong>
                  <br />
                  <span className="text-sm text-muted-foreground">{user.department}</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* SOS Markers */}
          {sosRequests
            .filter(s => s.status !== 'resolved')
            .map((sos) => (
              <Marker
                key={sos.id}
                position={[sos.location.lat, sos.location.lng]}
                icon={sosIcon}
                eventHandlers={{
                  click: () => onSelectSOS(sos),
                }}
              >
                <Popup>
                  <div className="min-w-[200px] p-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <strong className="capitalize">{sos.emergencyType}</strong>
                    </div>
                    <p className="text-sm mb-2">{sos.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => openGoogleMaps(sos.location.lat, sos.location.lng)}
                        className="flex-1 gap-1"
                      >
                        <Navigation className="w-4 h-4" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Selected SOS Info Card */}
        {selectedSOS && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <Card className="glass-card border-destructive">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPriorityColor(selectedSOS.priority) as any}>
                        {selectedSOS.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedSOS.emergencyType}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">
                      {selectedSOS.description || 'Emergency assistance required'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(selectedSOS.timestamp)}
                      </span>
                      {selectedSOS.peopleCount && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {selectedSOS.peopleCount} people
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => openGoogleMaps(selectedSOS.location.lat, selectedSOS.location.lng)}
                      className="gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Google Maps
                    </Button>
                    {selectedSOS.contactNumber && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `tel:${selectedSOS.contactNumber}`}
                        className="gap-1"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onSelectSOS(null)}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* SOS List Sidebar */}
      <div className="lg:w-80 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        <h4 className="font-semibold text-sm text-muted-foreground px-1">
          Active Emergencies ({sosRequests.filter(s => s.status !== 'resolved').length})
        </h4>
        {sosRequests
          .filter(s => s.status !== 'resolved')
          .map((sos) => (
            <Card
              key={sos.id}
              className={`cursor-pointer transition-all hover:border-primary ${
                selectedSOS?.id === sos.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onSelectSOS(sos)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant={getPriorityColor(sos.priority) as any}
                    className="text-xs"
                  >
                    {sos.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">
                    {sos.emergencyType}
                  </span>
                </div>
                <p className="text-sm truncate">
                  {sos.location.address || `${sos.location.lat.toFixed(3)}, ${sos.location.lng.toFixed(3)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(sos.timestamp)}
                </p>
              </CardContent>
            </Card>
          ))}
        {sosRequests.filter(s => s.status !== 'resolved').length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active emergencies</p>
          </div>
        )}
      </div>
    </div>
  );
}
