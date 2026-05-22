// Quick test of URL parser patterns
import { extractCoordsFromUrl, extractUrlsFromText, parseMultipleUrls } from './src/utils/urlParser.js';

// Test 1: WhatsApp pasted text
const whatsappText = `[9:45 AM, 5/18/2026] Loloty el 7ob kolo: https://www.google.com/maps/?q=21.552825481,39.161705656
[9:45 AM, 5/18/2026] Loloty el 7ob kolo: https://www.google.com/maps/?q=21.638453049,39.131642904
[9:45 AM, 5/18/2026] Loloty el 7ob kolo: https://goo.gl/maps/hXvNbKXD5LWPajPz6
[9:45 AM, 5/18/2026] Loloty el 7ob kolo: https://maps.app.goo.gl/tRTqcwBT9HZDtQww7
[9:45 AM, 5/18/2026] Loloty el 7ob kolo:  https://maps.app.goo.gl/bG1Lgkr32PJ6fTai9?g_st=ig`;

console.log('=== Test 1: extractUrlsFromText ===');
const urls = extractUrlsFromText(whatsappText);
console.log(`Found ${urls.length} URLs:`);
urls.forEach((u, i) => console.log(`  ${i+1}. ${u}`));

// Test 2: Direct coord extraction
console.log('\n=== Test 2: extractCoordsFromUrl ===');
const testUrls = [
  'https://www.google.com/maps/?q=21.552825481,39.161705656',
  'https://www.google.com.sa/maps/place/Whites/@21.5066596,39.2216443,17z/data=!3m1!4b1',
  'https://www.google.com/maps/place/21%C2%B037N+39%C2%B009E/@21.6242162,39.163243,21z',
];
for (const u of testUrls) {
  const coords = extractCoordsFromUrl(u);
  console.log(`  ${coords ? `✓ ${coords.lat}, ${coords.lng}` : '✗ NO MATCH'} ← ${u.substring(0, 60)}...`);
}

// Test 3: Full parse (with proxy)
console.log('\n=== Test 3: parseMultipleUrls (needs proxy on 3002) ===');
try {
  const results = await parseMultipleUrls(whatsappText, 'http://localhost:3002/api');
  console.log(`Parsed ${results.length} results:`);
  for (const r of results) {
    if (r.lat && r.lng) {
      console.log(`  ✓ ${r.lat.toFixed(6)}, ${r.lng.toFixed(6)} ${r.isShort ? '(resolved)' : ''}`);
    } else {
      console.log(`  ✗ FAILED: ${r.originalUrl} — ${r.error}`);
    }
  }
} catch (e) {
  console.log(`  Error: ${e.message}`);
}
