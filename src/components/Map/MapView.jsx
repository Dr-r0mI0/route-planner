import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp, STEPS } from '../../context/AppContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';
import MapContainer, { GOOGLE_MAPS_API_KEY } from './MapContainer';
import MapMarkerLayer from './MapMarkerLayer';
import MapRouteLayer from './MapRouteLayer';
import MapSearchOverlay from './MapSearchOverlay';
import { useMapPopupContent } from './MapInfoPopup';
import './MapView.css';

export default function MapView() {
  const {
    startPoint, setStartPoint,
    endPoint, setEndPoint, roundTrip,
    locations, optimizedRoute, step,
  } = useApp();

  const { t } = useI18n();
  const { buildPopupContent } = useMapPopupContent();

  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const tempMarkerRef = useRef(null);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleMapReady = useCallback((refs) => {
    mapInstanceRef.current = refs.map;
    infoWindowRef.current = refs.infoWindowRef.current;
    tempMarkerRef.current = refs.tempMarkerRef;
  }, []);

  const wrappedBuildPopup = useCallback((lat, lng, placeName, placeAddress, geoData, handlers) => {
    return buildPopupContent(lat, lng, placeName, placeAddress, geoData, {
      ...handlers,
      setStartPoint,
      setEndPoint,
      showToast,
      roundTrip,
      t,
    });
  }, [buildPopupContent, setStartPoint, setEndPoint, showToast, roundTrip, t]);

  return (
    <MapContainer
      buildPopupContent={wrappedBuildPopup}
      onMapReady={handleMapReady}
    >
      <MapMarkerLayer
        mapRef={mapInstanceRef}
        startPoint={startPoint}
        endPoint={endPoint}
        roundTrip={roundTrip}
        locations={locations}
        optimizedRoute={optimizedRoute}
        step={step}
      />

      <MapRouteLayer
        mapRef={mapInstanceRef}
        startPoint={startPoint}
        endPoint={endPoint}
        roundTrip={roundTrip}
        locations={locations}
        optimizedRoute={optimizedRoute}
        step={step}
      />

      <MapSearchOverlay
        mapRef={mapInstanceRef}
        tempMarkerRef={tempMarkerRef}
        infoWindowRef={infoWindowRef}
        buildPopupContent={wrappedBuildPopup}
      />
    </MapContainer>
  );
}