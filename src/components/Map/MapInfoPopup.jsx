import { useI18n } from '../../utils/i18n';

export function useMapPopupContent() {
  const { t } = useI18n();

  const buildPopupContent = (lat, lng, placeName, placeAddress, geoData, handlers) => {
    const {
      addLocation,
      appendToRawInput,
      closeAndCleanup,
      showToast,
      roundTrip,
    } = handlers;

    const content = document.createElement('div');
    content.className = 'map-view__add-popup-minimal';

    const showEndBtn = !roundTrip;

    content.innerHTML = `
      <div class="map-view__pill-container">
        <button class="map-view__pill-btn" data-action="set-start">
          ${t('map.setStart')}
        </button>
        <div class="map-view__pill-divider"></div>
        <button class="map-view__pill-btn" data-action="add-stop">
          ${t('map.addStop')}
        </button>
        ${showEndBtn ? `
        <div class="map-view__pill-divider"></div>
        <button class="map-view__pill-btn" data-action="set-end">
          ${t('map.setEnd')}
        </button>` : ''}
      </div>
    `;

    content.querySelector('[data-action="add-stop"]').addEventListener('click', () => {
      const coordUrl = `https://www.google.com/maps/?q=${lat},${lng}`;
      addLocation({
        lat, lng,
        name: geoData?.name || (placeName || '').split(' - ')[0],
        displayName: placeName || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        road: geoData?.road,
        suburb: geoData?.suburb,
        city: geoData?.city,
        unifiedUrl: coordUrl,
      });
      appendToRawInput(coordUrl);
      closeAndCleanup();
      showToast(t('map.added', { name: (placeName || '').split(' - ')[0].substring(0, 25) }));
    });

    content.querySelector('[data-action="set-start"]').addEventListener('click', () => {
      if (handlers.setStartPoint) {
        handlers.setStartPoint({ lat, lng, displayName: placeName || `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      }
      closeAndCleanup();
      showToast(t('map.startSet'));
    });

    const endBtn = content.querySelector('[data-action="set-end"]');
    if (endBtn) {
      endBtn.addEventListener('click', () => {
        if (handlers.setEndPoint) {
          handlers.setEndPoint({ lat, lng, displayName: placeName || `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        }
        closeAndCleanup();
        showToast(t('map.endSet'));
      });
    }

    return content;
  };

  return { buildPopupContent };
}

export function createPopupBuilder(t) {
  return (lat, lng, placeName, placeAddress, geoData, handlers) => {
    const {
      addLocation,
      appendToRawInput,
      closeAndCleanup,
      showToast,
      roundTrip,
    } = handlers;

    const content = document.createElement('div');
    content.className = 'map-view__add-popup-minimal';
    const showEndBtn = !roundTrip;

    content.innerHTML = `
      <div class="map-view__pill-container">
        <button class="map-view__pill-btn" data-action="set-start">
          ${t('map.setStart')}
        </button>
        <div class="map-view__pill-divider"></div>
        <button class="map-view__pill-btn" data-action="add-stop">
          ${t('map.addStop')}
        </button>
        ${showEndBtn ? `
        <div class="map-view__pill-divider"></div>
        <button class="map-view__pill-btn" data-action="set-end">
          ${t('map.setEnd')}
        </button>` : ''}
      </div>
    `;

    content.querySelector('[data-action="add-stop"]').addEventListener('click', () => {
      const coordUrl = `https://www.google.com/maps/?q=${lat},${lng}`;
      addLocation({
        lat, lng,
        name: geoData?.name || (placeName || '').split(' - ')[0],
        displayName: placeName || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        road: geoData?.road,
        suburb: geoData?.suburb,
        city: geoData?.city,
        unifiedUrl: coordUrl,
      });
      appendToRawInput(coordUrl);
      closeAndCleanup();
      showToast(t('map.added', { name: (placeName || '').split(' - ')[0].substring(0, 25) }));
    });

    content.querySelector('[data-action="set-start"]').addEventListener('click', () => {
      if (handlers.setStartPoint) {
        handlers.setStartPoint({ lat, lng, displayName: placeName || `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      }
      closeAndCleanup();
      showToast(t('map.startSet'));
    });

    const endBtn = content.querySelector('[data-action="set-end"]');
    if (endBtn) {
      endBtn.addEventListener('click', () => {
        if (handlers.setEndPoint) {
          handlers.setEndPoint({ lat, lng, displayName: placeName || `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        }
        closeAndCleanup();
        showToast(t('map.endSet'));
      });
    }

    return content;
  };
}