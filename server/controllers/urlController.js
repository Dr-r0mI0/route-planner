/**
 * URL Controller
 * Business logic for URL resolution endpoints
 */

import { resolveUrl, resolveUrlWithHtml } from '../services/urlResolver.js';

export async function resolveShortUrl(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const result = await resolveUrl(url);
    return res.json(result);
  } catch (err) {
    console.error('URL resolution failed:', url, err.message);
    return res.status(500).json({ error: 'Failed to resolve URL', details: err.message });
  }
}

export async function resolveHtmlUrl(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const result = await resolveUrlWithHtml(url);
    return res.json(result);
  } catch (err) {
    console.error('HTML resolution failed:', url, err.message);
    return res.status(500).json({ error: 'Failed to resolve URL', details: err.message });
  }
}

export default {
  resolveShortUrl,
  resolveHtmlUrl,
};