import { Client } from "@googlemaps/google-maps-services-js";
const client = new Client({});
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBfp8o3RtpaJ1IfXaibWid0f-D7aKSOwM0";

async function run() {
    const lat = 21.590697;
    const lng = 39.14423;
    
    const response = await client.placesNearby({
        params: {
            location: [lat, lng],
            rankby: "distance",
            type: "pharmacy",
            language: "en",
            key: GOOGLE_API_KEY
        }
    });

    const results = response.data.results;
    console.log(`Found ${results.length} pharmacy results.`);
    results.slice(0, 5).forEach((r, idx) => {
        console.log(`${idx + 1}. Name: ${r.name}`);
        console.log(`   Types: ${JSON.stringify(r.types)}`);
        console.log(`   Location: ${JSON.stringify(r.geometry.location)}`);
    });
}

run();
