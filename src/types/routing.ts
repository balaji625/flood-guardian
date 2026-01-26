import { Location } from './flood';

export interface RouteSegment {
  coordinates: [number, number][];
  isElevated: boolean;
  elevation: number;
  isFlooded: boolean;
  floodDepth?: number;
}

export interface FloodedRoad {
  id: string;
  coordinates: [number, number][];
  depth: 'ankle' | 'knee' | 'waist' | 'chest' | 'impassable';
  reportedAt: Date;
  verified: boolean;
}

export interface ElevatedPath {
  id: string;
  name: string;
  coordinates: [number, number][];
  minElevation: number;
  avgElevation: number;
  isSafe: boolean;
}

export interface SafeRoute {
  id: string;
  name: string;
  from: Location;
  to: Location;
  distance: number;
  duration: number;
  segments: RouteSegment[];
  safetyScore: number;
  warnings: string[];
  isRecommended: boolean;
}

export interface EvacuationPoint {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'high-ground' | 'assembly-point';
  location: { lat: number; lng: number };
  capacity?: number;
  currentOccupancy?: number;
  amenities?: string[];
  distance?: number;
}

export type RouteType = 'safe' | 'fastest' | 'elevated';
