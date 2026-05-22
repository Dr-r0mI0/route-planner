/**
 * ROUTE OPTIMIZER — i18n System
 * Lightweight key-value translation with React hook.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LANG_KEY = 'route_optimizer_lang';

const translations = {
  en: {
    // Header
    'app.name': 'ROUTE OPTIMIZER',
    'app.name.route': 'ROUTE',
    'app.name.optimizer': 'OPTIMIZER',

    // Start Point
    'start.label': 'START POINT',
    'activity.label': 'ACTIVITY TYPE',
    'activity.pharmacy': 'Pharmacies',
    'activity.clinic': 'Clinics',
    'activity.hospital': 'Hospitals',
    'activity.placeholder': 'Activity Type',
    'start.placeholder': 'Paste location URL or coordinates...',
    'start.gps.title': 'Use my location',
    'start.gps.loading': 'Getting location...',
    'start.gps.denied': 'Location permission denied',
    'start.gps.unavailable': 'Location unavailable',
    'start.gps.timeout': 'Location timeout',
    'start.gps.unsupported': 'GPS not supported',
    'start.useAsEnd': 'Use as End Point',
    'end.label': 'END POINT',
    'end.placeholder': 'Paste end location URL or coordinates...',

    // Link Input
    'links.label': 'Location Links',
    'links.placeholder': 'Paste Google Maps links here, one per line...\n\nExamples:\nhttps://www.google.com/maps/?q=21.552825,39.161705\nhttps://goo.gl/maps/hXvNbKXD5LWPajPz6\n21.552825,39.161705',
    'links.detected': '{count} link(s) detected',
    'links.mapAdded': '{count} added from map',
    'links.hint': 'Supports: full URLs, short links (goo.gl), raw coordinates',
    'links.continue': 'CONTINUE',
    'links.processing': 'Processing...',
    'links.error.empty': 'Please paste at least one location link.',
    'links.error.none': 'No valid location links found. Please check your input.',
    'links.parsing': 'Parsing URLs...',
    'links.resolving': 'Resolving locations...',

    // Location List
    'locations.title': 'LOCATION LIST',
    'locations.label': 'LOCATIONS',
    'locations.stops': '{count} stop(s)',
    'locations.stops.label': 'Stops',
    'locations.wait.label': 'WAITING',
    'locations.bookable.label': 'BOOKABLE',
    'locations.bookable': 'BOOKABLE',
    'locations.empty': 'No valid locations found. Go back and check your links.',
    'locations.back': '← Back',
    'locations.optimize': 'CONTINUE',
    'locations.calculating': 'Calculating...',
    'locations.allowedTime': 'ALLOWED VISIT TIME',
    'locations.waitingTime': 'WAITING',
    'locations.book': 'BOOK',
    'locations.from': 'From',
    'locations.to': 'To',
    'locations.min': 'MIN',
    'locations.startPoint': 'START POINT',

    // Route Result / Active Route
    'route.title': 'LOCATION LIST',
    'route.optimizedTitle': 'Optimized Route',
    'route.distance': 'Distance',
    'route.driving': 'DRIVING',
    'route.waitTime': 'WAITING',
    'route.locationsLabel': 'LOCATIONS',
    'route.visited': 'VISITED',
    'route.remain': 'REMAIN',
    'route.start': 'START ROUTE',
    'route.fullMaps': 'Full Route in Maps',
    'route.save': 'Save',
    'route.edit': '← Edit',
    'route.saved': '✓ Route saved!',
    'route.navigate': 'NAVIGATE',
    'route.list': 'LIST',
    'route.map': 'MAP',
    'route.expectedWaiting': 'EXPECTED WAITING',
    'route.allowedTime': 'ALLOWED TIME',
    'route.booked': 'BOOKED',
    'route.time': 'TIME',
    'route.complete': 'Route Complete!',
    'route.km': 'KM',

    // Map
    'map.search': 'SEARCH',
    'map.searchPlaceholder': 'Search for a place...',
    'map.addStop': 'NEW LOCATION',
    'map.setStart': 'START POINT',
    'map.setEnd': 'END POINT',
    'map.added': '✓ Added: {name}',
    'map.startSet': '✓ Start point set',
    'map.endSet': '✓ End point set',

    // Theme
    'theme.dark': 'Dark',
    'theme.light': 'Light',

    // General
    'general.close': 'Close',
    'general.noRoute': 'No route calculated.',
  },

  ar: {
    // Header
    'app.name': 'مُحسّن المسارات',
    'app.name.route': 'مُحسّن',
    'app.name.optimizer': 'المسارات',

    // Start Point
    'start.label': 'نقطة البداية',
    'activity.label': 'نوع النشاط',
    'activity.pharmacy': 'صيدليات',
    'activity.clinic': 'عيادات',
    'activity.hospital': 'مستشفيات',
    'activity.placeholder': 'نوع النشاط',
    'start.placeholder': 'الصق رابط الموقع أو الإحداثيات...',
    'start.gps.title': 'استخدم موقعي',
    'start.gps.loading': 'جاري تحديد الموقع...',
    'start.gps.denied': 'تم رفض إذن الموقع',
    'start.gps.unavailable': 'الموقع غير متاح',
    'start.gps.timeout': 'انتهت مهلة الموقع',
    'start.gps.unsupported': 'GPS غير مدعوم',
    'start.useAsEnd': 'استخدم كنقطة نهاية',
    'end.label': 'نقطة النهاية',
    'end.placeholder': 'الصق رابط نقطة النهاية أو الإحداثيات...',

    // Link Input
    'links.label': 'روابط المواقع',
    'links.placeholder': 'الصق روابط خرائط جوجل هنا، كل رابط في سطر...\n\nأمثلة:\nhttps://www.google.com/maps/?q=21.552825,39.161705\nhttps://goo.gl/maps/hXvNbKXD5LWPajPz6\n21.552825,39.161705',
    'links.detected': '{count} رابط مُكتشف',
    'links.mapAdded': '{count} مُضاف من الخريطة',
    'links.hint': 'يدعم: روابط كاملة، روابط مختصرة، إحداثيات',
    'links.continue': 'متابعة',
    'links.processing': 'جاري المعالجة...',
    'links.error.empty': 'الرجاء لصق رابط موقع واحد على الأقل.',
    'links.error.none': 'لم يتم العثور على روابط صالحة.',
    'links.parsing': 'جاري تحليل الروابط...',
    'links.resolving': 'جاري تحديد المواقع...',

    // Location List
    'locations.title': 'قائمة المواقع',
    'locations.label': 'المواقع',
    'locations.stops': '{count} محطة',
    'locations.stops.label': 'محطات',
    'locations.wait.label': 'الانتظار',
    'locations.bookable.label': 'قابل للحجز',
    'locations.bookable': 'قابل للحجز',
    'locations.empty': 'لم يتم العثور على مواقع. عد وتحقق من الروابط.',
    'locations.back': 'رجوع ←',
    'locations.optimize': 'متابعة',
    'locations.calculating': 'جاري الحساب...',
    'locations.allowedTime': 'وقت الزيارة المسموح',
    'locations.waitingTime': 'الانتظار',
    'locations.book': 'حجز',
    'locations.from': 'من',
    'locations.to': 'إلى',
    'locations.min': 'دقيقة',
    'locations.startPoint': 'نقطة البداية',

    // Route Result / Active Route
    'route.title': 'قائمة المواقع',
    'route.optimizedTitle': 'المسار المحسّن',
    'route.distance': 'المسافة',
    'route.driving': 'القيادة',
    'route.waitTime': 'الانتظار',
    'route.locationsLabel': 'المواقع',
    'route.visited': 'تمت الزيارة',
    'route.remain': 'متبقي',
    'route.start': 'ابدأ المسار',
    'route.fullMaps': 'المسار في الخرائط',
    'route.save': 'حفظ',
    'route.edit': 'تعديل ←',
    'route.saved': '✓ تم حفظ المسار!',
    'route.navigate': 'اذهب',
    'route.list': 'قائمة',
    'route.map': 'خريطة',
    'route.expectedWaiting': 'الانتظار المتوقع',
    'route.allowedTime': 'الوقت المسموح',
    'route.booked': 'محجوز',
    'route.time': 'الوقت',
    'route.complete': 'اكتمل المسار!',
    'route.km': 'كم',

    // Map
    'map.search': 'بحث',
    'map.searchPlaceholder': 'ابحث عن مكان...',
    'map.addStop': 'موقع جديد',
    'map.setStart': 'نقطة البداية',
    'map.setEnd': 'نقطة النهاية',
    'map.added': '✓ تمت الإضافة: {name}',
    'map.startSet': '✓ تم تحديد نقطة البداية',
    'map.endSet': '✓ تم تحديد نقطة النهاية',

    // Theme
    'theme.dark': 'داكن',
    'theme.light': 'فاتح',

    // General
    'general.close': 'إغلاق',
    'general.noRoute': 'لم يتم حساب المسار.',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LANG_KEY) || 'en';
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Set initial dir
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = useCallback((key, vars) => {
    let str = translations[lang]?.[key] || translations.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  }, [lang]);

  const isRTL = lang === 'ar';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
