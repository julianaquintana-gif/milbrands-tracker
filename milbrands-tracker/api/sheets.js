const https = require('https');
const url = require('url');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygBrsBPdgmDNzuGGNHJaaaBtJHKGZegto_D1XT-1L69Bbf8KX0TUTRO2o0SpVbVGxncw/exec';

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const makeRequest = (reqUrl) => {
      const parsed = url.parse(reqUrl);
      https.get({
        hostname: parsed.hostname,
        path: parsed.path,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          makeRequest(res.headers.location);
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    };
    makeRequest(targetUrl);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  try {
    const data = await fetchUrl(APPS_SCRIPT_URL);
    res.status(200).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
