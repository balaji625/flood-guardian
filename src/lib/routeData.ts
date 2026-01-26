import { FloodedRoad, ElevatedPath, EvacuationPoint } from '@/types/routing';

// Sample flooded roads around Mumbai (for demonstration)
export const FLOODED_ROADS: FloodedRoad[] = [
  {
    id: 'fr1',
    coordinates: [[19.072, 72.870], [19.070, 72.875], [19.068, 72.880]],
    depth: 'waist',
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: 'fr2',
    coordinates: [[19.080, 72.885], [19.082, 72.890]],
    depth: 'knee',
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: 'fr3',
    coordinates: [[19.065, 72.865], [19.063, 72.868], [19.060, 72.870]],
    depth: 'chest',
    reportedAt: new Date(),
    verified: true,
  },
  {
    id: 'fr4',
    coordinates: [[19.078, 72.872], [19.076, 72.874]],
    depth: 'ankle',
    reportedAt: new Date(),
    verified: false,
  },
  {
    id: 'fr5',
    coordinates: [[19.085, 72.878], [19.087, 72.882], [19.088, 72.885]],
    depth: 'impassable',
    reportedAt: new Date(),
    verified: true,
  },
];

// Elevated safe paths
export const ELEVATED_PATHS: ElevatedPath[] = [
  {
    id: 'ep1',
    name: 'Marine Drive Elevated Corridor',
    coordinates: [[19.070, 72.820], [19.075, 72.822], [19.080, 72.825], [19.085, 72.830]],
    minElevation: 25,
    avgElevation: 30,
    isSafe: true,
  },
  {
    id: 'ep2',
    name: 'Malabar Hill Route',
    coordinates: [[19.085, 72.805], [19.090, 72.808], [19.095, 72.812]],
    minElevation: 40,
    avgElevation: 55,
    isSafe: true,
  },
  {
    id: 'ep3',
    name: 'Worli Skyway',
    coordinates: [[19.015, 72.820], [19.020, 72.825], [19.025, 72.830], [19.030, 72.835]],
    minElevation: 35,
    avgElevation: 42,
    isSafe: true,
  },
  {
    id: 'ep4',
    name: 'Bandra-Kurla Complex Bridge',
    coordinates: [[19.065, 72.865], [19.068, 72.870], [19.072, 72.875]],
    minElevation: 20,
    avgElevation: 28,
    isSafe: true,
  },
];

// Evacuation points
export const EVACUATION_POINTS: EvacuationPoint[] = [
  {
    id: 'ev1',
    name: 'NSCI Dome Shelter',
    type: 'shelter',
    location: { lat: 19.018, lng: 72.830 },
    capacity: 2000,
    currentOccupancy: 450,
    amenities: ['Food', 'Water', 'Medical Aid', 'Toilets'],
  },
  {
    id: 'ev2',
    name: 'Wankhede Stadium Assembly',
    type: 'assembly-point',
    location: { lat: 18.939, lng: 72.826 },
    capacity: 5000,
    currentOccupancy: 200,
    amenities: ['Open Space', 'Emergency Lighting'],
  },
  {
    id: 'ev3',
    name: 'Joggers Park High Ground',
    type: 'high-ground',
    location: { lat: 19.056, lng: 72.820 },
    amenities: ['Open Space', 'High Elevation'],
  },
  {
    id: 'ev4',
    name: 'Lilavati Hospital',
    type: 'hospital',
    location: { lat: 19.050, lng: 72.828 },
    capacity: 200,
    currentOccupancy: 120,
    amenities: ['Medical Care', 'Emergency Room', 'Ambulance'],
  },
  {
    id: 'ev5',
    name: 'Oval Maidan Open Ground',
    type: 'assembly-point',
    location: { lat: 18.932, lng: 72.831 },
    capacity: 3000,
    currentOccupancy: 100,
    amenities: ['Open Space', 'Near Hospitals'],
  },
  {
    id: 'ev6',
    name: 'Sion Fort Garden',
    type: 'high-ground',
    location: { lat: 19.040, lng: 72.860 },
    amenities: ['Elevated Terrain', 'Open Space'],
  },
];

// Helper to get flood depth color
export function getFloodDepthColor(depth: FloodedRoad['depth']): string {
  switch (depth) {
    case 'ankle':
      return 'hsl(38, 95%, 60%)';
    case 'knee':
      return 'hsl(25, 95%, 55%)';
    case 'waist':
      return 'hsl(15, 95%, 50%)';
    case 'chest':
      return 'hsl(0, 85%, 45%)';
    case 'impassable':
      return 'hsl(0, 90%, 30%)';
    default:
      return 'hsl(0, 70%, 50%)';
  }
}

// Helper to get flood depth label
export function getFloodDepthLabel(depth: FloodedRoad['depth']): string {
  switch (depth) {
    case 'ankle':
      return 'Ankle Deep (~15cm)';
    case 'knee':
      return 'Knee Deep (~45cm)';
    case 'waist':
      return 'Waist Deep (~90cm)';
    case 'chest':
      return 'Chest Deep (~130cm)';
    case 'impassable':
      return 'IMPASSABLE (>150cm)';
    default:
      return 'Unknown Depth';
  }
}

// Calculate distance between two points
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest evacuation points
export function findNearestEvacuationPoints(
  lat: number,
  lng: number,
  limit: number = 5
): EvacuationPoint[] {
  return EVACUATION_POINTS.map((point) => ({
    ...point,
    distance: calculateDistance(lat, lng, point.location.lat, point.location.lng),
  }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, limit);
}
