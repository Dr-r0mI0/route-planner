import { useEffect, useRef } from 'react';
import { useApp, STEPS } from '../../context/AppContext';

export default function MapRouteLayer({ mapRef, startPoint, endPoint, roundTrip, locations, optimizedRoute, step }) {
  const polylineRef = useRef(null);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !window.google?.maps) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Only draw route in RESULT step
    if (step !== STEPS.RESULT || !optimizedRoute?.route) {
      return;
    }

    // Build path
    const path = [];
    if (startPoint?.lat) path.push({ lat: startPoint.lat, lng: startPoint.lng });
    
    optimizedRoute.route.forEach(idx => {
      const loc = locations[idx];
      if (loc?.lat && loc?.lng) path.push({ lat: loc.lat, lng: loc.lng });
    });

    if (!roundTrip && endPoint?.lat) {
      path.push({ lat: endPoint.lat, lng: endPoint.lng });
    } else if (roundTrip && startPoint?.lat) {
      path.push({ lat: startPoint.lat, lng: startPoint.lng });
    }

    if (path.length > 1) {
      polylineRef.current = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#dd7445',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      });
    }
  }, [mapRef, startPoint, endPoint, roundTrip, locations, optimizedRoute, step]);

  return null;
}