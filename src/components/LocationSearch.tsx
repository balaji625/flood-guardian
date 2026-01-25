import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Location } from '@/types/flood';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  className?: string;
}

export function LocationSearch({ onLocationSelect, className }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const { getCurrentLocation, loading: geoLoading } = useGeolocation();

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`
      );
      const data = await response.json();
      setResults(data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name.split(',')[0],
        state: item.display_name.split(',').slice(-2, -1)[0]?.trim(),
      })));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    await getCurrentLocation();
    // The location will be set via the hook
  };

  const handleSelect = (location: Location) => {
    setQuery(location.name);
    setResults([]);
    onLocationSelect(location);
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
            className="pl-10 pr-4 h-12 text-lg bg-card border-border"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          onClick={handleGetCurrentLocation}
          disabled={geoLoading}
          variant="secondary"
          className="h-12 px-4"
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
              key={`${location.lat}-${location.lng}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelect(location)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium">{location.name}</p>
                {location.state && (
                  <p className="text-sm text-muted-foreground">{location.state}</p>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
