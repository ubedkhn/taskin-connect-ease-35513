import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MapViewProps {
  userLocation?: { lat: number; lng: number };
  providerLocation?: { lat: number; lng: number };
  showApiKeyInput?: boolean;
  onApiKeyChange?: (key: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  userLocation, 
  providerLocation,
  showApiKeyInput = true,
  onApiKeyChange 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const providerMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    const center: [number, number] = userLocation 
      ? [userLocation.lng, userLocation.lat]
      : [77.2090, 28.6139]; // Default to Delhi

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.current.on('load', () => {
      setIsMapReady(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !isMapReady) return;

    if (userLocation) {
      if (userMarker.current) {
        userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg';
        userMarker.current = new mapboxgl.Marker(el)
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<p class="font-semibold">User Location</p>'))
          .addTo(map.current);
      }
    }

    if (providerLocation) {
      if (providerMarker.current) {
        providerMarker.current.setLngLat([providerLocation.lng, providerLocation.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg';
        providerMarker.current = new mapboxgl.Marker(el)
          .setLngLat([providerLocation.lng, providerLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<p class="font-semibold">Service Provider</p>'))
          .addTo(map.current);
      }

      // Fit bounds to show both markers
      if (userLocation && map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userLocation.lng, userLocation.lat]);
        bounds.extend([providerLocation.lng, providerLocation.lat]);
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [userLocation, providerLocation, isMapReady]);

  const handleTokenChange = (value: string) => {
    setMapboxToken(value);
    onApiKeyChange?.(value);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {showApiKeyInput && !mapboxToken && (
        <div className="p-4 bg-card border-b">
          <Label htmlFor="mapbox-token">Enter your Mapbox Public Token</Label>
          <Input
            id="mapbox-token"
            type="text"
            placeholder="pk.eyJ1..."
            value={mapboxToken}
            onChange={(e) => handleTokenChange(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get your token from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      )}
      <div ref={mapContainer} className="flex-1 w-full" />
    </div>
  );
};

export default MapView;
