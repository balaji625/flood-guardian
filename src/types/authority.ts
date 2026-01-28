// Authority Types - Extensible for future additions
export type AuthorityType = 
  | 'police' 
  | 'doctor' 
  | 'hospital' 
  | 'fire' 
  | 'ambulance' 
  | 'authority' // Disaster Management
  | 'admin';

export interface AuthorityConfig {
  id: AuthorityType;
  label: string;
  shortLabel: string;
  icon: string; // Lucide icon name
  color: string;
  emergencyNumber?: string;
  canReceiveSOS: boolean;
  canVerifyReports: boolean;
  canManageResources: boolean;
}

// Extensible authority configuration
export const AUTHORITY_CONFIGS: Record<AuthorityType, AuthorityConfig> = {
  police: {
    id: 'police',
    label: 'Police Station',
    shortLabel: 'Police',
    icon: 'Shield',
    color: 'hsl(217, 91%, 60%)', // Blue
    emergencyNumber: '100',
    canReceiveSOS: true,
    canVerifyReports: true,
    canManageResources: false,
  },
  doctor: {
    id: 'doctor',
    label: 'Doctor / Medical Professional',
    shortLabel: 'Doctor',
    icon: 'Stethoscope',
    color: 'hsl(160, 84%, 39%)', // Teal
    emergencyNumber: '108',
    canReceiveSOS: true,
    canVerifyReports: false,
    canManageResources: false,
  },
  hospital: {
    id: 'hospital',
    label: 'Hospital',
    shortLabel: 'Hospital',
    icon: 'Building2',
    color: 'hsl(0, 84%, 60%)', // Red
    emergencyNumber: '108',
    canReceiveSOS: true,
    canVerifyReports: true,
    canManageResources: true,
  },
  fire: {
    id: 'fire',
    label: 'Fire & Rescue Service',
    shortLabel: 'Fire',
    icon: 'Flame',
    color: 'hsl(25, 95%, 53%)', // Orange
    emergencyNumber: '101',
    canReceiveSOS: true,
    canVerifyReports: true,
    canManageResources: true,
  },
  ambulance: {
    id: 'ambulance',
    label: 'Ambulance Service',
    shortLabel: 'Ambulance',
    icon: 'Truck',
    color: 'hsl(142, 71%, 45%)', // Green
    emergencyNumber: '108',
    canReceiveSOS: true,
    canVerifyReports: false,
    canManageResources: true,
  },
  authority: {
    id: 'authority',
    label: 'Disaster Management Authority',
    shortLabel: 'Authority',
    icon: 'AlertTriangle',
    color: 'hsl(280, 87%, 65%)', // Purple
    emergencyNumber: '1078',
    canReceiveSOS: true,
    canVerifyReports: true,
    canManageResources: true,
  },
  admin: {
    id: 'admin',
    label: 'System Administrator',
    shortLabel: 'Admin',
    icon: 'Settings',
    color: 'hsl(190, 95%, 45%)', // Cyan
    canReceiveSOS: true,
    canVerifyReports: true,
    canManageResources: true,
  },
};

// Service Area for routing
export interface ServiceArea {
  id: string;
  name: string;
  pincode?: string;
  district: string;
  state: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

// Authority registration data
export interface AuthorityRegistration {
  uid: string;
  email: string;
  name: string;
  authorityType: AuthorityType;
  department: string;
  stationName: string;
  stationAddress: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  serviceArea: ServiceArea;
  verified: boolean;
  createdAt: number;
  fcmToken?: string; // For push notifications
}

// Request routing data
export interface RoutedRequest {
  requestId: string;
  requestType: 'sos' | 'report';
  assignedTo: string[]; // Authority UIDs
  area: ServiceArea;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'dispatched' | 'resolved';
  createdAt: number;
  acknowledgedBy?: string;
  dispatchedBy?: string;
  resolvedBy?: string;
}

// Get authorities that can handle specific emergency types
export function getAuthoritiesForEmergency(emergencyType: string): AuthorityType[] {
  switch (emergencyType) {
    case 'flood':
    case 'trapped':
      return ['fire', 'ambulance', 'police', 'authority'];
    case 'medical':
      return ['ambulance', 'hospital', 'doctor'];
    case 'fire':
      return ['fire', 'ambulance', 'police'];
    case 'other':
    default:
      return ['police', 'fire', 'ambulance', 'authority'];
  }
}

// Calculate distance between two coordinates in km
export function calculateDistanceKm(
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

// Check if a location is within a service area
export function isWithinServiceArea(
  lat: number,
  lng: number,
  area: ServiceArea
): boolean {
  if (area.bounds) {
    return (
      lat >= area.bounds.south &&
      lat <= area.bounds.north &&
      lng >= area.bounds.west &&
      lng <= area.bounds.east
    );
  }
  // Default: within 15km of center
  const distance = calculateDistanceKm(lat, lng, area.center.lat, area.center.lng);
  return distance <= 15;
}
