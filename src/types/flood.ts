export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FloodRiskData {
  score: number;
  level: RiskLevel;
  rainfallContribution: number;
  elevationContribution: number;
  historicalContribution: number;
  rainfall: number;
  elevation: number;
  historicalProbability: number;
}

export interface Location {
  lat: number;
  lng: number;
  name: string;
  pincode?: string;
  district?: string;
  state?: string;
}

export interface SOSRequest {
  id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  emergencyType: 'flood' | 'trapped' | 'medical' | 'fire' | 'other';
  description?: string;
  status: 'pending' | 'acknowledged' | 'dispatched' | 'resolved';
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  contactNumber?: string;
  peopleCount?: number;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire' | 'ambulance' | 'shelter';
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  phone: string;
  available: boolean;
  capacity?: number;
  currentLoad?: number;
}

export interface CrowdReport {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  waterLevel: 'ankle' | 'knee' | 'waist' | 'chest' | 'above';
  imageUrl?: string;
  description: string;
  timestamp: number;
  verified: boolean;
  reporterContact?: string;
}

export interface Alert {
  id: string;
  area: string;
  riskLevel: RiskLevel;
  message: string;
  timestamp: number;
  active: boolean;
  instructions: string[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  icon: string;
  forecast: {
    time: string;
    rainfall: number;
    temperature: number;
  }[];
}

export type UserRole = 'admin' | 'authority' | 'police' | 'hospital' | 'ambulance' | 'fire';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string;
}
