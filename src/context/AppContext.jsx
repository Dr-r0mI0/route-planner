import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { generateId, getTodayKey } from '../utils/formatters';
import { optimizeRoute as runOptimization } from '../utils/routeOptimizer';

const AppContext = createContext(null);

const STORAGE_KEY = 'rout_planner_data';
const ACTIVE_SESSION_KEY = 'rout_planner_active_session';

// Steps in the flow
export const STEPS = {
  INPUT: 'input',
  LOCATIONS: 'locations',
  RESULT: 'result',
};

const initialState = {
  step: STEPS.INPUT,
  startPoint: null,           // { lat, lng, displayName }
  endPoint: null,             // { lat, lng, displayName } - only when roundTrip=false
  roundTrip: true,            // return to start point?
  rawInput: '',               // text from textarea
  mapAddedCount: 0,           // how many locations were added from the map
  locations: [],              // parsed + geocoded locations
  optimizedRoute: null,       // result from optimizer
  isLoading: false,
  loadingProgress: { current: 0, total: 0, message: '' },
  error: null,
  savedRoutes: [],
  preferredTypes: [],
};

function initApp() {
  try {
    const activeStr = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (activeStr) {
      const parsed = JSON.parse(activeStr);
      return { ...initialState, ...parsed, isLoading: false, error: null };
    }
  } catch (e) {
    console.error('Failed to parse active session', e);
  }
  return initialState;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, error: null };

    case 'SET_START_POINT':
      return { ...state, startPoint: action.payload };

    case 'SET_RAW_INPUT':
      return { ...state, rawInput: action.payload };

    case 'APPEND_RAW_INPUT': {
      const sep = state.rawInput.trim() ? '\n' : '';
      return {
        ...state,
        rawInput: state.rawInput + sep + action.payload,
        mapAddedCount: state.mapAddedCount + 1,
      };
    }

    case 'SET_END_POINT':
      return { ...state, endPoint: action.payload };

    case 'SET_ROUND_TRIP':
      return { ...state, roundTrip: action.payload };

    case 'SET_PREFERRED_TYPES':
      return { ...state, preferredTypes: action.payload };

    case 'SET_LOCATIONS':
      return { ...state, locations: action.payload, step: STEPS.LOCATIONS };

    case 'UPDATE_LOCATION': {
      const updated = state.locations.map(loc =>
        loc.id === action.payload.id ? { ...loc, ...action.payload.updates } : loc
      );
      return { ...state, locations: updated };
    }

    case 'REMOVE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(loc => loc.id !== action.payload),
      };

    case 'ADD_LOCATION': {
      return {
        ...state,
        locations: [...state.locations, action.payload],
      };
    }

    case 'SET_OPTIMIZED_ROUTE':
      return { ...state, optimizedRoute: action.payload, step: STEPS.RESULT };

    case 'SET_ROUTE_ORDER': {
      return { ...state, optimizedRoute: { ...state.optimizedRoute, ...action.payload } };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_PROGRESS':
      return { ...state, loadingProgress: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'RESET':
      try { localStorage.removeItem(ACTIVE_SESSION_KEY); } catch(e){}
      return { ...initialState, savedRoutes: state.savedRoutes, roundTrip: state.roundTrip };

    case 'LOAD_SAVED_ROUTES':
      return { ...state, savedRoutes: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, initApp);

  // Handle browser back button (History API)
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.step) {
        dispatch({ type: 'SET_STEP', payload: e.state.step });
      } else {
        const hashStep = window.location.hash.replace('#', '');
        if (Object.values(STEPS).includes(hashStep)) {
          dispatch({ type: 'SET_STEP', payload: hashStep });
        } else {
          dispatch({ type: 'SET_STEP', payload: STEPS.INPUT });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    const currentHash = window.location.hash.replace('#', '');
    if (Object.values(STEPS).includes(currentHash)) {
      dispatch({ type: 'SET_STEP', payload: currentHash });
      window.history.replaceState({ step: currentHash }, '', `#${currentHash}`);
    } else {
      window.history.replaceState({ step: state.step }, '', `#${state.step}`);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-save active session
  useEffect(() => {
    const sessionData = {
      step: state.step,
      startPoint: state.startPoint,
      endPoint: state.endPoint,
      roundTrip: state.roundTrip,
      rawInput: state.rawInput,
      locations: state.locations,
      optimizedRoute: state.optimizedRoute,
      preferredTypes: state.preferredTypes,
    };
    
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
      } catch (e) {
        console.error('Failed to auto-save session', e);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    state.step, state.startPoint, state.endPoint, state.roundTrip, 
    state.rawInput, state.locations, state.optimizedRoute, state.preferredTypes
  ]);

  const navigateToStep = (step) => {
    if (window.location.hash.replace('#', '') !== step) {
      window.history.pushState({ step }, '', `#${step}`);
    }
  };

  const setStep = useCallback((step) => {
    navigateToStep(step);
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setStartPoint = useCallback((point) => {
    dispatch({ type: 'SET_START_POINT', payload: point });
  }, []);

  const setRawInput = useCallback((text) => {
    dispatch({ type: 'SET_RAW_INPUT', payload: text });
  }, []);

  const appendToRawInput = useCallback((text) => {
    dispatch({ type: 'APPEND_RAW_INPUT', payload: text });
  }, []);

  const setEndPoint = useCallback((point) => {
    dispatch({ type: 'SET_END_POINT', payload: point });
  }, []);

  const setRoundTrip = useCallback((val) => {
    dispatch({ type: 'SET_ROUND_TRIP', payload: val });
  }, []);

  const setPreferredTypes = useCallback((types) => {
    dispatch({ type: 'SET_PREFERRED_TYPES', payload: types });
  }, []);

  const setLocations = useCallback((locations) => {
    // Assign IDs and defaults
    const withDefaults = locations.map((loc, i) => ({
      ...loc,
      id: loc.id || generateId(),
      order: i,
      waitTime: loc.waitTime ?? 10,
      hasBooking: loc.hasBooking ?? false,
      visitTimeStart: loc.visitTimeStart || 'anytime',
      visitTimeEnd: loc.visitTimeEnd || 'anytime',
    }));
    navigateToStep(STEPS.LOCATIONS);
    dispatch({ type: 'SET_LOCATIONS', payload: withDefaults });
  }, []);

  const updateLocation = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_LOCATION', payload: { id, updates } });
  }, []);

  const removeLocation = useCallback((id) => {
    dispatch({ type: 'REMOVE_LOCATION', payload: id });
  }, []);

  const addLocation = useCallback((locationData) => {
    const loc = {
      ...locationData,
      id: locationData.id || generateId(),
      order: 0,
      waitTime: locationData.waitTime ?? 10,
      hasBooking: locationData.hasBooking ?? false,
      visitTimeStart: locationData.visitTimeStart || 'anytime',
      visitTimeEnd: locationData.visitTimeEnd || 'anytime',
    };
    dispatch({ type: 'ADD_LOCATION', payload: loc });
    return loc;
  }, []);

  const setOptimizedRoute = useCallback((route) => {
    navigateToStep(STEPS.RESULT);
    dispatch({ type: 'SET_OPTIMIZED_ROUTE', payload: route });
  }, []);

  const setRouteOrder = useCallback((data) => {
    dispatch({ type: 'SET_ROUTE_ORDER', payload: data });
  }, []);

  const optimizeRoute = useCallback(async () => {
    const locs = state.locations;
    if (!locs || locs.length < 2) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_PROGRESS', payload: { current: 0, total: 0, message: 'Optimizing route...' } });
    try {
      // Use Haversine-only (no apiKey) since Distance Matrix API has CORS issues from browser
      const result = await runOptimization(locs, null);
      // Attach locations so RouteResult can map route indices to location data
      dispatch({ type: 'SET_OPTIMIZED_ROUTE', payload: { ...result, locations: locs } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: `Optimization failed: ${err.message}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.locations]);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setProgress = useCallback((current, total, message = '') => {
    dispatch({ type: 'SET_PROGRESS', payload: { current, total, message } });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const reset = useCallback(() => {
    navigateToStep(STEPS.INPUT);
    dispatch({ type: 'RESET' });
  }, []);

  // Persistence
  const saveCurrentRoute = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const routeData = {
        id: generateId(),
        date: getTodayKey(),
        timestamp: Date.now(),
        startPoint: state.startPoint,
        locations: state.locations,
        optimizedRoute: state.optimizedRoute,
      };
      saved.unshift(routeData);
      // Keep only last 50 routes
      const trimmed = saved.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      dispatch({ type: 'LOAD_SAVED_ROUTES', payload: trimmed });
      return routeData;
    } catch (e) {
      console.error('Save failed:', e);
      return null;
    }
  }, [state.startPoint, state.locations, state.optimizedRoute]);

  const loadSavedRoutes = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      dispatch({ type: 'LOAD_SAVED_ROUTES', payload: saved });
      return saved;
    } catch (e) {
      return [];
    }
  }, []);

  const deleteSavedRoute = useCallback((id) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filtered = saved.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      dispatch({ type: 'LOAD_SAVED_ROUTES', payload: filtered });
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }, []);

  const loadRoute = useCallback((routeData) => {
    if (routeData.startPoint) setStartPoint(routeData.startPoint);
    if (routeData.locations) {
      dispatch({ type: 'SET_LOCATIONS', payload: routeData.locations });
    }
    if (routeData.optimizedRoute) {
      dispatch({ type: 'SET_OPTIMIZED_ROUTE', payload: routeData.optimizedRoute });
    }
  }, [setStartPoint]);

  const value = {
    ...state,
    setStep,
    setStartPoint,
    setEndPoint,
    setRoundTrip,
    setPreferredTypes,
    setRawInput,
    appendToRawInput,
    setLocations,
    updateLocation,
    removeLocation,
    addLocation,
    setOptimizedRoute,
    setRouteOrder,
    optimizeRoute,
    setLoading,
    setProgress,
    setError,
    clearError,
    reset,
    saveCurrentRoute,
    loadSavedRoutes,
    deleteSavedRoute,
    loadRoute,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
