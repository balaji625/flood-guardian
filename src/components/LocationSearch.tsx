import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Loader2, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Location } from '@/types/flood';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  className?: string;
}

export function LocationSearch({ onLocationSelect, className }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (value.trim().length < 2) {
      setSearching(false);
      setResults([]);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5&addressdetails=1`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
            // Avoid sending a referrer to third-party API
            referrerPolicy: 'no-referrer',
          }
        );

        if (!response.ok) throw new Error(`Search failed (${response.status})`);

        const data = await response.json();
        const locations: Location[] = (data || []).map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name?.split(',')?.[0] || value,
          state: item.display_name?.split(',')?.slice(-2, -1)?.[0]?.trim(),
          district: item.display_name?.split(',')?.slice(1, 2)?.[0]?.trim(),
          pincode: item.address?.postcode,
        }));

        setResults(locations);
        if (locations.length === 0 && value.trim().length >= 3) {
          toast.info('No locations found. Try a different search term.');
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        console.error('Location search error:', error);
        toast.error('Search failed. Please try again.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const handleGetCurrentLocation = async () => {
    setGeoLoading(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;

      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              Accept: 'application/json',
            },
            referrerPolicy: 'no-referrer',
          }
        );
        
        if (!response.ok) throw new Error('Reverse geocoding failed');
        
        const data = await response.json();
        
        const location: Location = {
          lat,
          lng,
          name: data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Current Location',
          district: data.address?.county || data.address?.state_district,
          state: data.address?.state,
          pincode: data.address?.postcode,
        };
        
        setQuery(location.name);
        onLocationSelect(location);
        toast.success(`Location found: ${location.name}`);
      } catch {
        // If reverse geocoding fails, still use coordinates
        const location: Location = {
          lat,
          lng,
          name: 'Current Location',
        };
        setQuery('Current Location');
        onLocationSelect(location);
        toast.success('Location detected via GPS');
      }
    } catch (err) {
      const error = err as GeolocationPositionError | Error;
      let message = 'Failed to get location';
      
      if ('code' in error) {
        switch (error.code) {
          case 1:
            message = 'Location access denied. Please enable location services in your browser settings.';
            break;
          case 2:
            message = 'Location unavailable. Please try again.';
            break;
          case 3:
            message = 'Location request timed out. Please try again.';
            break;
        }
      }
      
      toast.error(message);
      console.error('Geolocation error:', error);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSelect = (location: Location) => {
    setQuery(location.name);
    setResults([]);
    onLocationSelect(location);
    toast.success(`Selected: ${location.name}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search village, city, or PIN code..."
            className="pl-10 pr-10 h-12 text-lg bg-card border-border"
          />
          {query && !searching && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
          )}
        </div>
        <Button
          onClick={handleGetCurrentLocation}
          disabled={geoLoading}
          variant="secondary"
          className="h-12 px-4 bg-gradient-to-r from-success to-emerald-500 text-success-foreground hover:opacity-90 border-0"
        >
          {geoLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
          <span className="ml-2 hidden sm:inline">Current Location</span>
        </Button>
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden"
        >
          {results.map((location, index) => (
            <motion.button
              key={`${location.lat}-${location.lng}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelect(location)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left border-b border-border/50 last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{location.name}</p>
                {(location.district || location.state) && (
                  <p className="text-sm text-muted-foreground">
                    {[location.district, location.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
