import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { reverseGeocode } from '../../utils/geocoder';
import './MapView.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBfp8o3RtpaJ1IfXaibWid0f-D7aKSOwM0';

const darkStyles = [
  { elementType: 'geometry', stylers: [{ color: '#333333' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#333333' }, { weight: 2 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#4d4d4d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#333333' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#595959' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#3b3b3b' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#333333' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#4d4d4d' }] }
];

export { darkStyles, GOOGLE_MAPS_API_KEY };

export default function MapContainer({
  buildPopupContent,
  onMapReady,
  children
}) {
  const { isLight } = useTheme();
  const { addLocation, appendToRawInput } = useApp();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const tempMarkerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=ar`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps');
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 21.5, lng: 39.2 },
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: isLight ? [] : darkStyles,
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    if (onMapReady) {
      onMapReady({
        map,
        mapRef: mapInstanceRef,
        infoWindowRef,
        tempMarkerRef,
      });
    }

    // --- CLICK-TO-ADD ---
    map.addListener('click', async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (tempMarkerRef.current) {
        tempMarkerRef.current.setMap(null);
        tempMarkerRef.current = null;
      }

      const tempMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#F59E0B',
          fillOpacity: 0.9,
          strokeColor: '#dd7445',
          strokeWeight: 2,
        },
        animation: window.google.maps.Animation.DROP,
        zIndex: 200,
      });
      tempMarkerRef.current = tempMarker;

      // Reverse geocode
      let placeName = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      let placeAddress = '';
      let geoData = {};

      try {
        const geocoded = await reverseGeocode(lat, lng, GOOGLE_MAPS_API_KEY);
        if (geocoded) {
          placeName = geocoded.displayName || placeName;
          placeAddress = [geocoded.road, geocoded.suburb, geocoded.city].filter(Boolean).join(', ');
          geoData = geocoded;
        }
      } catch (_) { /* use coords */ }

      if (buildPopupContent) {
        const content = buildPopupContent(lat, lng, placeName, placeAddress, geoData, {
          addLocation,
          appendToRawInput,
          closeAndCleanup: () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
            if (tempMarkerRef.current) {
              tempMarkerRef.current.setMap(null);
              tempMarkerRef.current = null;
            }
          },
          showToast,
        });
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, tempMarker);

        infoWindowRef.current.addListener('closeclick', () => {
          tempMarker.setMap(null);
          tempMarkerRef.current = null;
        });
      }
    });
  }, [mapLoaded, buildPopupContent, onMapReady, addLocation, appendToRawInput, showToast, isLight]);

  // Update map style when theme changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({ styles: isLight ? [] : darkStyles });
    }
  }, [isLight]);

  return (
    <div className="map-view">
      <div ref={mapRef} className="map-view__container" />

      {!mapLoaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1b1b1b',
        }}>
          <div className="w-8 h-8 border-3 border-[#e06938] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {toast && <div className="map-view__toast">{toast}</div>}
      
      {children}
    </div>
  );
}