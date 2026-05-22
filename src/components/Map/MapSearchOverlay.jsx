import { useEffect, useRef } from 'react';

export default function MapSearchOverlay({ mapRef, tempMarkerRef, infoWindowRef, buildPopupContent }) {
  const autocompleteRef = useRef(null);
  const buildPopupContentRef = useRef(null);

  useEffect(() => {
    buildPopupContentRef.current = buildPopupContent;
  }, [buildPopupContent]);

  // Search autocomplete
  useEffect(() => {
    const externalInput = document.getElementById('map-search-input');
    if (!window.google?.maps?.places || !externalInput || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(externalInput, {
      fields: ['geometry', 'name', 'formatted_address', 'place_id'],
    });

    if (mapRef?.current) {
      autocomplete.bindTo('bounds', mapRef.current);
    }

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const map = mapRef?.current;
      if (!map) return;

      map.panTo({ lat, lng });
      map.setZoom(15);

      if (tempMarkerRef?.current) {
        tempMarkerRef.current.setMap(null);
        tempMarkerRef.current = null;
      }

      const marker = new window.google.maps.Marker({
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
      tempMarkerRef.current = marker;

      const placeName = place.name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const placeAddress = place.formatted_address || '';

      if (buildPopupContentRef.current && infoWindowRef?.current) {
        const content = buildPopupContentRef.current(lat, lng, `${placeName} - ${placeAddress}`, placeAddress, {
          name: placeName,
          city: placeAddress.split(',').slice(-2, -1)[0]?.trim() || '',
        });

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);

        infoWindowRef.current.addListener('closeclick', () => {
          marker.setMap(null);
          if (tempMarkerRef) tempMarkerRef.current = null;
        });
      }

      const extInput = document.getElementById('map-search-input');
      if (extInput) extInput.value = '';
    });

    autocompleteRef.current = autocomplete;
  }, [mapRef, tempMarkerRef, infoWindowRef]);

  return null;
}