import { useState, useCallback } from 'react';
import { Location } from '@/types/flood';

interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  searchLocation: (query: string) => Promise<Location[]>;
}

// Sample locations in India for demo
const sampleLocations: Location[] = [
  { lat: 19.076, lng: 72.8777, name: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { lat: 28.6139, lng: 77.209, name: 'New Delhi', state: 'Delhi', pincode: '110001' },
  { lat: 22.5726, lng: 88.3639, name: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { lat: 13.0827, lng: 80.2707, name: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { lat: 17.385, lng: 78.4867, name: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { lat: 12.9716, lng: 77.5946, name: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
  { lat: 18.5204, lng: 73.8567, name: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { lat: 21.1702, lng: 72.8311, name: 'Surat', state: 'Gujarat', pincode: '395001' },
  { lat: 26.8467, lng: 80.9462, name: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
];

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;

      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        
        setLocation({
          lat,
          lng,
          name: data.address?.city || data.address?.town || data.address?.village || 'Current Location',
          district: data.address?.county || data.address?.state_district,
          state: data.address?.state,
          pincode: data.address?.postcode,
        });
      } catch {
        // If reverse geocoding fails, still use coordinates
        setLocation({
          lat,
          lng,
          name: 'Current Location',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof GeolocationPositionError
        ? err.code === 1
          ? 'Location access denied. Please enable location services.'
          : err.code === 2
          ? 'Location unavailable. Please try again.'
          : 'Location request timed out.'
        : 'Failed to get location';
      setError(errorMessage);
      
      // Fallback to Mumbai as default
      setLocation(sampleLocations[0]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchLocation = useCallback(async (query: string): Promise<Location[]> => {
    if (!query.trim()) return [];

    try {
      // First check sample locations
      const matchedSamples = sampleLocations.filter(loc =>
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.pincode?.includes(query) ||
        loc.state?.toLowerCase().includes(query.toLowerCase())
      );

      if (matchedSamples.length > 0) {
        return matchedSamples;
      }

      // Use Nominatim for search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      );
      const data = await response.json();

      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name.split(',')[0],
        state: item.address?.state,
        pincode: item.address?.postcode,
      }));
    } catch {
      // Return filtered sample locations on error
      return sampleLocations.filter(loc =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }, []);

  return { location, loading, error, getCurrentLocation, searchLocation };
}
