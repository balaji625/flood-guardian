import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, RiskLevel, EmergencyService } from '@/types/flood';
import { getRiskColor } from '@/lib/floodRiskCalculator';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, type: string) => {
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

const serviceIcons = {
  hospital: createCustomIcon('#ef4444', 'hospital'),
  police: createCustomIcon('#3b82f6', 'police'),
  fire: createCustomIcon('#f97316', 'fire'),
  ambulance: createCustomIcon('#22c55e', 'ambulance'),
  shelter: createCustomIcon('#8b5cf6', 'shelter'),
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
    map.setView([location.lat, location.lng], 13);
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

  return (
    <div className={className}>
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
