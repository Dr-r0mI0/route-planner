import { useEffect, useRef } from 'react';
import { useApp, STEPS } from '../../context/AppContext';

export default function MapMarkerLayer({ mapRef, startPoint, endPoint, roundTrip, locations, optimizedRoute, step }) {
  const markersRef = useRef([]);

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !window.google?.maps) return;
    
    clearMarkers();

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    // Start point marker
    if (startPoint?.lat && startPoint?.lng) {
      const marker = new window.google.maps.Marker({
        position: { lat: startPoint.lat, lng: startPoint.lng },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#dd7445',
          strokeWeight: 2,
        },
        title: 'Start Point',
        zIndex: 100,
      });
      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
      hasPoints = true;
    }

    // End point marker
    if (!roundTrip && endPoint?.lat && endPoint?.lng) {
      const marker = new window.google.maps.Marker({
        position: { lat: endPoint.lat, lng: endPoint.lng },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#dd7445',
          strokeWeight: 2,
        },
        title: 'End Point',
        zIndex: 100,
      });
      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
      hasPoints = true;
    }

    // Location markers
    const displayLocations = step === STEPS.RESULT && optimizedRoute
      ? optimizedRoute.route.map(idx => locations[idx]).filter(Boolean)
      : locations;

    displayLocations.forEach((loc, i) => {
      if (!loc?.lat || !loc?.lng) return;

      const marker = new window.google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map,
        label: {
          text: String(i + 1),
          color: '#fff',
          fontSize: '11px',
          fontWeight: '600',
        },
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: loc.hasBooking ? '#F59E0B' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#dd7445',
          strokeWeight: 1,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 22),
          labelOrigin: new window.google.maps.Point(12, 9),
        },
        title: loc.displayName || `Location ${i + 1}`,
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
      hasPoints = true;
    });

    // Auto-zoom
    if (hasPoints) {
      if (markersRef.current.length === 1) {
        map.setCenter(markersRef.current[0].getPosition());
        map.setZoom(14);
      } else {
        map.fitBounds(bounds, { padding: 50 });
      }
    }

    return () => clearMarkers();
  }, [mapRef, startPoint, endPoint, roundTrip, locations, optimizedRoute, step]);

  return null;
}