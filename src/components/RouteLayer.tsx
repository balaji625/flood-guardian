import React, { useEffect, useState } from 'react';
import { useMap, Polyline, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '@/types/flood';
import { EvacuationPoint, RouteType } from '@/types/routing';
import { 
  FLOODED_ROADS, 
  ELEVATED_PATHS, 
  EVACUATION_POINTS,
  getFloodDepthColor,
  getFloodDepthLabel
} from '@/lib/routeData';

interface RouteLayerProps {
  currentLocation: Location | null;
  destination: EvacuationPoint | null;
  routeType: RouteType;
  showFloodedRoads: boolean;
  showElevatedPaths: boolean;
  showEvacuationPoints: boolean;
  isNavigating: boolean;
}

// Create evacuation point icons
const createEvacuationIcon = (type: EvacuationPoint['type']) => {
  const colors = {
    shelter: '#8b5cf6',
    hospital: '#ef4444',
    'high-ground': '#22c55e',
    'assembly-point': '#3b82f6',
  };
  
  const icons = {
    shelter: '🏕️',
    hospital: '🏥',
    'high-ground': '⛰️',
    'assembly-point': '👥',
  };

  return L.divIcon({
    html: `
      <div style="
        background: ${colors[type]};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${icons[type]}
      </div>
    `,
    className: 'evacuation-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Create flood warning icon
const floodWarningIcon = L.divIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #ef4444, #dc2626);
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    ">
      ⚠️
    </div>
  `,
  className: 'flood-warning-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export function RouteLayer({
  currentLocation,
  destination,
  routeType,
  showFloodedRoads,
  showElevatedPaths,
  showEvacuationPoints,
  isNavigating,
}: RouteLayerProps) {
  const map = useMap();
  const [simulatedRoute, setSimulatedRoute] = useState<[number, number][]>([]);

  // Generate a simulated safe route when navigating
  useEffect(() => {
    if (isNavigating && currentLocation && destination) {
      // Create a simple simulated route (in real app, would use routing API)
      const start: [number, number] = [currentLocation.lat, currentLocation.lng];
      const end: [number, number] = [destination.location.lat, destination.location.lng];
      
      // Generate intermediate points that avoid flooded areas
      const route: [number, number][] = [start];
      
      const steps = 8;
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        let lat = start[0] + (end[0] - start[0]) * t;
        let lng = start[1] + (end[1] - start[1]) * t;
        
        // Add some variation to make route look realistic
        // and simulate avoiding flooded areas
        const offset = Math.sin(t * Math.PI * 2) * 0.005;
        if (routeType === 'elevated') {
          // Route goes slightly north (simulating higher ground)
          lat += 0.008 * Math.sin(t * Math.PI);
        } else if (routeType === 'safe') {
          // Route avoids center (simulating flooded area avoidance)
          lng += offset;
        }
        
        route.push([lat, lng]);
      }
      
      route.push(end);
      setSimulatedRoute(route);

      // Fit map to show entire route
      const bounds = L.latLngBounds(route.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      setSimulatedRoute([]);
    }
  }, [isNavigating, currentLocation, destination, routeType, map]);

  return (
    <>
      {/* Flooded Roads */}
      {showFloodedRoads && FLOODED_ROADS.map((road) => (
        <React.Fragment key={road.id}>
          <Polyline
            positions={road.coordinates.map(([lat, lng]) => [lat, lng] as [number, number])}
            pathOptions={{
              color: getFloodDepthColor(road.depth),
              weight: 8,
              opacity: 0.8,
              dashArray: road.depth === 'impassable' ? undefined : '10, 10',
            }}
          />
          {/* Flood warning marker at center of road */}
          <Marker
            position={road.coordinates[Math.floor(road.coordinates.length / 2)]}
            icon={floodWarningIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <strong className="text-red-600">⚠️ FLOODED ROAD</strong>
                <br />
                <span className="text-sm font-semibold">{getFloodDepthLabel(road.depth)}</span>
                <br />
                <span className="text-xs text-gray-500">
                  {road.verified ? '✓ Verified' : 'Unverified Report'}
                </span>
                <br />
                <span className="text-xs text-red-500 font-bold">DO NOT ENTER</span>
              </div>
            </Popup>
          </Marker>
          {/* Danger zone circle around flooded road */}
          <Circle
            center={road.coordinates[Math.floor(road.coordinates.length / 2)]}
            radius={200}
            pathOptions={{
              color: getFloodDepthColor(road.depth),
              fillColor: getFloodDepthColor(road.depth),
              fillOpacity: 0.15,
              weight: 1,
              dashArray: '5, 5',
            }}
          />
        </React.Fragment>
      ))}

      {/* Elevated Safe Paths */}
      {showElevatedPaths && ELEVATED_PATHS.map((path) => (
        <React.Fragment key={path.id}>
          <Polyline
            positions={path.coordinates.map(([lat, lng]) => [lat, lng] as [number, number])}
            pathOptions={{
              color: 'hsl(142, 75%, 45%)',
              weight: 6,
              opacity: 0.9,
            }}
          />
          <Marker
            position={path.coordinates[0]}
            icon={L.divIcon({
              html: `
                <div style="
                  background: linear-gradient(135deg, #22c55e, #16a34a);
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 10px;
                  color: white;
                  font-weight: bold;
                  white-space: nowrap;
                  border: 2px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                ">
                  ⬆️ ${path.avgElevation}m
                </div>
              `,
              className: 'elevation-marker',
              iconSize: [60, 24],
              iconAnchor: [30, 12],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <strong className="text-green-600">🛡️ {path.name}</strong>
                <br />
                <span className="text-sm">Safe Elevated Route</span>
                <br />
                <span className="text-xs text-gray-600">
                  Elevation: {path.minElevation}m - {path.avgElevation}m
                </span>
                <br />
                <span className="text-xs text-green-600 font-bold">✓ RECOMMENDED PATH</span>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}

      {/* Evacuation Points */}
      {showEvacuationPoints && EVACUATION_POINTS.map((point) => (
        <Marker
          key={point.id}
          position={[point.location.lat, point.location.lng]}
          icon={createEvacuationIcon(point.type)}
        >
          <Popup>
            <div className="min-w-[180px] p-2">
              <strong className="text-base">{point.name}</strong>
              <br />
              <span className="text-sm capitalize text-gray-600">
                {point.type.replace('-', ' ')}
              </span>
              {point.capacity && (
                <>
                  <br />
                  <span className="text-sm">
                    Capacity: {point.currentOccupancy}/{point.capacity}
                  </span>
                  <div className="w-full h-2 bg-gray-200 rounded mt-1">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${((point.currentOccupancy || 0) / point.capacity) * 100}%`,
                        backgroundColor: (point.currentOccupancy || 0) / point.capacity > 0.8 
                          ? '#ef4444' 
                          : (point.currentOccupancy || 0) / point.capacity > 0.5 
                          ? '#f59e0b' 
                          : '#22c55e',
                      }}
                    />
                  </div>
                </>
              )}
              {point.amenities && (
                <>
                  <br />
                  <span className="text-xs text-gray-500">
                    {point.amenities.join(' • ')}
                  </span>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Active Navigation Route */}
      {isNavigating && simulatedRoute.length > 0 && (
        <>
          {/* Route shadow */}
          <Polyline
            positions={simulatedRoute}
            pathOptions={{
              color: 'hsl(0, 0%, 0%)',
              weight: 10,
              opacity: 0.2,
            }}
          />
          {/* Main route */}
          <Polyline
            positions={simulatedRoute}
            pathOptions={{
              color: routeType === 'elevated' 
                ? 'hsl(142, 75%, 45%)' 
                : routeType === 'safe'
                ? 'hsl(217, 91%, 60%)'
                : 'hsl(38, 95%, 50%)',
              weight: 6,
              opacity: 1,
            }}
          />
          {/* Animated dash overlay */}
          <Polyline
            positions={simulatedRoute}
            pathOptions={{
              color: 'white',
              weight: 2,
              opacity: 0.8,
              dashArray: '10, 20',
              dashOffset: '0',
            }}
          />
          {/* Direction arrows along route */}
          {simulatedRoute.filter((_, i) => i % 2 === 0 && i < simulatedRoute.length - 1).map((pos, i) => (
            <Marker
              key={`arrow-${i}`}
              position={pos}
              icon={L.divIcon({
                html: `<div style="font-size: 16px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">➤</div>`,
                className: 'direction-arrow',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            />
          ))}
        </>
      )}
    </>
  );
}
