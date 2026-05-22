import { Client } from "@googlemaps/google-maps-services-js";

const googleMapsClient = new Client({});
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBfp8o3RtpaJ1IfXaibWid0f-D7aKSOwM0";

export class GoogleMapsPipeline {
    
    /**
     * STAGE 1: Extract URLs from completely messy text blocks.
     * Handles stuck characters, missing spaces, and newlines.
     * Cuts off at standard URL characters to ignore trailing non-URL text (like Arabic words).
     * Also detects raw coordinate pairs and normalizes them to Google Maps query URLs.
     */
    static extractUrls(text) {
        if (!text) return [];
        const results = [];
        
        // 1. Extract Google Maps URLs
        const urlRegex = /https?:\/\/(?:www\.)?(?:google\.[a-z.]{2,6}\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)\/?[a-zA-Z0-9$_.+!*'(),;/?:@=&%-]*/ig;
        const urlMatches = text.match(urlRegex) || [];
        for (const url of urlMatches) {
            results.push(url.replace(/[.,;:!?)]+$/, ''));
        }

        // 2. Extract Raw Coordinates (e.g. 24.7136, 46.6753)
        const lines = text.split(/[\n\r]+/);
        for (const line of lines) {
            const coordRegex = /(-?\d{1,3}\.\d{3,})\s*[,،]\s*(-?\d{1,3}\.\d{3,})/;
            const coordMatch = line.match(coordRegex);
            if (coordMatch && !line.includes('http')) {
                const lat = coordMatch[1];
                const lng = coordMatch[2];
                results.push(`https://www.google.com/maps/?q=${lat},${lng}`);
            }
        }

        return [...new Set(results)];
    }

    /**
     * STAGE 2 & 3: Resolve Short URLs using high-performance HTTP HEAD requests.
     * Prevents downloading heavy HTML/JS payloads.
     */
    static async resolveShortUrl(url) {
        // Optimization Check: If coordinates already exist in the URL string, skip network request
        if (url.includes('/@') || url.includes('query=') || url.includes('?q=') || url.includes('ll=')) {
            return url;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.url || url;
        } catch (error) {
            // Fallback to original URL on network failure/timeout
            return url;
        }
    }

    /**
     * Parses Latitude and Longitude values using comprehensive pattern matching.
     */
    static extractCoordinates(finalUrl) {
        // Standard formats: @lat,lng or query=lat,lng or ll=lat,lng or q=lat,lng
        const coordRegex = /(?:@|query=|ll=|q=)(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/;
        let match = finalUrl.match(coordRegex);

        if (match) {
            return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[2])
            };
        }

        // Protobuf format !3dlat!4dlng
        const data3d4d = finalUrl.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
        if (data3d4d) {
            return {
                lat: parseFloat(data3d4d[1]),
                lng: parseFloat(data3d4d[2])
            };
        }

        // Protobuf format !2dlng!3dlat (note order)
        const data2d3d = finalUrl.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/);
        if (data2d3d) {
            return {
                lat: parseFloat(data2d3d[2]),
                lng: parseFloat(data2d3d[1])
            };
        }

        return null;
    }

    /**
     * STAGE 4: Reverse Geofencing using Google Nearby Search
     * Fetches the closest registered commercial name/POI.
     * Uses distance ranking to find the absolute closest place.
     */
    static async getNearestPlaceName(lat, lng, lang, preferredTypes = []) {
        try {
            const response = await googleMapsClient.placesNearby({
                params: {
                    location: [lat, lng],
                    rankby: "distance", // Rank by distance instead of prominence
                    language: lang || "ar",
                    key: GOOGLE_API_KEY
                }
            });

            const results = response.data.results;
            if (results && results.length > 0) {
                const hasArabic = (text) => /[\u0600-\u06FF]/.test(text);
                const hasEnglish = (text) => /[a-zA-Z]/.test(text);
                
                const getKeywordsForPref = (pref) => {
                    if (pref === 'pharmacy') return ['pharmacy', 'صيدلية', 'صيدليه'];
                    if (pref === 'clinic') return ['clinic', 'عيادة', 'عيادات', 'مركز طبي', 'medical center', 'medical care', 'polyclinic', 'doctor', 'dentist'];
                    if (pref === 'hospital') return ['hospital', 'مستشفى', 'مستشفيات'];
                    return [];
                };

                let specificPoi = null;

                // 1. First, check if there are preferred types matched
                if (preferredTypes && preferredTypes.length > 0) {
                    const matchedResults = results.filter(r => {
                        for (const pref of preferredTypes) {
                            if (pref === 'pharmacy' && r.types.includes('pharmacy')) return true;
                            if (pref === 'clinic' && (r.types.includes('doctor') || r.types.includes('dentist') || r.types.includes('physiotherapist') || r.types.includes('health'))) return true;
                            if (pref === 'hospital' && (r.types.includes('hospital') || r.types.includes('medical_lab') || r.types.includes('health'))) return true;
                        }
                        return false;
                    });

                    if (matchedResults.length > 0) {
                        // Prioritize results whose name matches the keywords of the preferred type
                        let bestMatch = matchedResults.find(r => {
                            return preferredTypes.some(pref => {
                                const kws = getKeywordsForPref(pref);
                                return kws.some(kw => r.name.toLowerCase().includes(kw));
                            });
                        });
                        
                        if (!bestMatch) {
                            bestMatch = matchedResults[0];
                        }

                        specificPoi = bestMatch;
                    }
                }

                // 2. If no preferred types matched, score all specific POIs to select the best one
                if (!specificPoi) {
                    const genericTypes = [
                        "locality", "political", "country", 
                        "administrative_area_level_1", "administrative_area_level_2", 
                        "sublocality", "neighborhood", "route", "intersection", 
                        "premise", "subpremise", "postal_code", "natural_feature"
                    ];
                    
                    const specificResults = results.filter(r => {
                        return !r.types.some(t => genericTypes.includes(t));
                    });

                    if (specificResults.length > 0) {
                        const scoredResults = specificResults.map((r, index) => {
                            let score = 100 - index * 4; // Prefer closer distance

                            const prominentTypes = [
                                'pharmacy', 'hospital', 'supermarket', 'grocery_or_supermarket',
                                'shopping_mall', 'convenience_store', 'gas_station', 'restaurant', 'cafe',
                                'store', 'food'
                            ];
                            
                            const utilityTypes = [
                                'parking', 'valet_parking', 'lawyer', 'real_estate_agency', 
                                'finance', 'accounting', 'establishment'
                            ];

                            const medicalTypes = ['health', 'clinic', 'doctor', 'dentist', 'medical_lab'];

                            const hasType = (tList) => r.types.some(t => tList.includes(t));

                            if (hasType(prominentTypes)) score += 40;
                            if (hasType(medicalTypes)) score += 20;
                            if (hasType(utilityTypes)) score -= 60;

                            const prominentKeywords = [
                                'pharmacy', 'صيدلية', 'صيدليه', 'hospital', 'مستشفى', 'مستشفيات',
                                'supermarket', 'سوبرماركت', 'بندة', 'العثيم', 'النهدي', 'nahdi'
                            ];
                            const lowerName = r.name.toLowerCase();
                            if (prominentKeywords.some(kw => lowerName.includes(kw))) {
                                score += 30;
                            }

                            // Language check fallback priority
                            if (lang === 'en' && hasEnglish(r.name)) {
                                score += 15;
                            } else if (lang === 'ar' && hasArabic(r.name)) {
                                score += 15;
                            }

                            return { result: r, score };
                        });

                        // Sort descending by score
                        scoredResults.sort((a, b) => b.score - a.score);
                        specificPoi = scoredResults[0].result;
                    }
                }

                if (specificPoi) {
                    return {
                        name: specificPoi.name,
                        types: specificPoi.types
                    };
                }

                return {
                    name: results[0].name,
                    types: results[0].types
                };
            }
            return null;
        } catch (error) {
            console.error("Google Places API Error:", error.message);
            return null;
        }
    }

    /**
     * Reverse geocodes coordinates to retrieve address details (neighborhood, street, city) in the requested language.
     */
    static async getAddressDetails(lat, lng, lang) {
        try {
            const geocodeResp = await googleMapsClient.reverseGeocode({
                params: {
                    latlng: [lat, lng],
                    language: lang || "ar",
                    key: GOOGLE_API_KEY
                }
            });
            const results = geocodeResp.data.results;
            if (results && results.length > 0) {
                let neighborhood = "";
                let street = "";
                let city = "";
                
                // Search components across results for maximum detail
                for (const res of results) {
                    for (const comp of res.address_components) {
                        if (comp.types.includes("neighborhood") || comp.types.includes("sublocality_level_1")) {
                            if (!neighborhood) neighborhood = comp.long_name;
                        }
                        if (comp.types.includes("route")) {
                            if (!street) street = comp.long_name;
                        }
                        if (comp.types.includes("locality")) {
                            if (!city) city = comp.long_name;
                        }
                    }
                }
                
                const parts = [neighborhood, street, city].filter(Boolean);
                return {
                    neighborhood,
                    street,
                    city,
                    description: parts.join("، ")
                };
            }
        } catch (e) {
            console.error("Reverse geocode error:", e.message);
        }
        return { neighborhood: "", street: "", city: "", description: "" };
    }

    /**
     * Helper to select the part of a name matching the requested language,
     * resolving mixed English/Arabic names (like "United Pharmacy - صيدلية المتحدة").
     */
    static selectLanguageName(fullName, lang) {
        if (!fullName) return "";
        
        // Split by common separators: - , | / (only with spaces for hyphens)
        const parts = fullName.split(/\s*(?:\s+-\s+|\s+–\s+|\s+—\s+|[|/,])\s*/);
        
        if (parts.length === 1) {
            // If there's no clear separator, check if there's a mix of Arabic and English blocks.
            // e.g. "مجمع الليزر الطبي المتخصص Laser Medical Specialist Polyclinic"
            const hasArabic = (text) => /[\u0600-\u06FF]/.test(text);
            const hasEnglish = (text) => /[a-zA-Z]/.test(text);
            
            if (hasArabic(fullName) && hasEnglish(fullName)) {
                // Find contiguous Arabic and English word sequences
                const arabicMatch = fullName.match(/[\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*/g);
                const englishMatch = fullName.match(/[a-zA-Z0-9'-]+(?:\s+[a-zA-Z0-9'-]+)*/g);
                
                if (arabicMatch && englishMatch) {
                    const arabicPart = arabicMatch.join(" ");
                    const englishPart = englishMatch.join(" ");
                    if (lang === "ar") {
                        return arabicPart.trim();
                    } else {
                        return englishPart.trim();
                    }
                }
            }
        } else {
            const hasArabic = (text) => /[\u0600-\u06FF]/.test(text);
            const arabicPart = parts.find(p => hasArabic(p));
            const englishPart = parts.find(p => !hasArabic(p));
            
            if (lang === "ar") {
                return (arabicPart || englishPart || fullName).trim();
            } else {
                return (englishPart || arabicPart || fullName).trim();
            }
        }
        
        return fullName.trim();
    }

    /**
     * Checks if a search query is actually raw/DMS coordinates.
     */
    static isCoordinateQuery(query) {
        if (!query) return false;
        
        // Decimal: e.g. 21.579575, 39.159151
        if (query.match(/^-?\d+\.\d+\s*[,،\s]\s*-?\d+\.\d+$/)) {
            return true;
        }
        
        // DMS format: contains degrees (°), minutes ('), seconds (") and directions (N/S/E/W)
        if (query.includes('°') || query.match(/\d+["'″′][NS]/i) || query.match(/[NS]\s*\d/i)) {
            return true;
        }
        
        return false;
    }

    /**
     * Extracts text query or place name from a Google Maps URL if no coordinates are present.
     */
    static extractQueryText(url) {
        try {
            const urlObj = new URL(url);
            const q = urlObj.searchParams.get('q');
            if (q && !q.match(/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/)) {
                return decodeURIComponent(q);
            }
        } catch (e) {}

        const placeMatch = url.match(/\/maps\/place\/([^/]+)/);
        if (placeMatch) {
            return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        }

        return null;
    }

    /**
     * Geocodes a text query / place name to retrieve coordinates.
     */
    static async geocodeQuery(query) {
        try {
            const response = await googleMapsClient.geocode({
                params: {
                    address: query,
                    key: GOOGLE_API_KEY
                }
            });

            const results = response.data.results;
            if (results && results.length > 0) {
                return {
                    lat: results[0].geometry.location.lat,
                    lng: results[0].geometry.location.lng
                };
            }
            return null;
        } catch (error) {
            console.error("Geocoding query error:", error.message);
            return null;
        }
    }

    /**
     * Main Executor Pipeline
     */
    static async processText(dirtyText, lang, preferredTypes = []) {
        const rawUrls = this.extractUrls(dirtyText);
        const processingPayload = [];

        for (const url of rawUrls) {
            try {
                const resolvedUrl = await this.resolveShortUrl(url);
                let coordinates = this.extractCoordinates(resolvedUrl);
                
                let isPlaceUrl = false;
                let placeName = "";
                let addressDesc = "";
                let queryText = this.extractQueryText(resolvedUrl);
                
                // If it is a coordinate query (decimal or DMS), treat it as a coordinate location
                if (queryText && this.isCoordinateQuery(queryText)) {
                    queryText = null;
                }

                // 1. Check if the URL contains a search query or place name
                if (queryText) {
                    isPlaceUrl = true;
                    const parts = queryText.split(",");
                    placeName = parts[0].trim();
                    addressDesc = parts.slice(1).map(p => p.trim()).filter(Boolean).join("، ") || "جدة";
                    
                    coordinates = await this.geocodeQuery(queryText);
                }

                // 2. If it's a coordinate URL or map view (no place name in URL)
                let addressDetails = null;
                if (!isPlaceUrl && coordinates) {
                    const poiDetails = await this.getNearestPlaceName(coordinates.lat, coordinates.lng, lang, preferredTypes);
                    addressDetails = await this.getAddressDetails(coordinates.lat, coordinates.lng, lang);
                    
                    placeName = poiDetails ? poiDetails.name : (addressDetails.street || addressDetails.neighborhood || "موقع على الخريطة");
                    addressDesc = addressDetails.description || "جدة";
                }

                // Select language-specific part of the placeName
                placeName = this.selectLanguageName(placeName, lang);

                processingPayload.push({
                    inputUrl: url,
                    coordinates: coordinates,
                    closestPoi: placeName || "Unknown Location",
                    addressDescription: addressDesc,
                    metadata: {
                        isPlaceUrl,
                        originalQuery: queryText,
                        addressComponents: addressDetails
                    }
                });
            } catch (err) {
                processingPayload.push({ inputUrl: url, error: err.message, status: "Failed" });
            }
        }
        return processingPayload;
    }
}