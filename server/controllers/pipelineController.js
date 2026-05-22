/**
 * Pipeline Controller
 * Business logic for Google Maps Pipeline
 */

import { GoogleMapsPipeline } from '../services/googleMapsPipeline.js';

export async function processTextHandler(req, res) {
  const { text, lang, preferredTypes } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  try {
    const result = await GoogleMapsPipeline.processText(text, lang || 'ar', preferredTypes || []);
    res.json(result);
  } catch (err) {
    console.error('Process text failed:', err.message);
    res.status(500).json({ error: 'Failed to process text', details: err.message });
  }
}

export default {
  processTextHandler,
};