const path = require('path');
const fs   = require('fs');

let clients = {};
try {
  clients = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'clients.json'), 'utf8')
  );
} catch (e) {}

module.exports = function handler(req, res) {
  // Read the slug from the Referer header (the page that requested the manifest)
  const referer = req.headers.referer || req.headers.referrer || '';
  let slug = '';
  try {
    slug = new URL(referer).pathname.replace(/^\/+/, '').split('/')[0];
  } catch (_) {}

  const client = clients[slug];
  const name   = client?.name || 'Reseñas Google';

  const manifest = {
    name:             name + ' — Reseña Google',
    short_name:       'Reseñas',
    description:      'Envía solicitudes de reseñas de Google al instante.',
    start_url:        slug ? '/' + slug : '/',
    scope:            '/',
    display:          'standalone',
    background_color: '#EEF2FF',
    theme_color:      '#4F46E5',
    orientation:      'portrait-primary',
    lang:             'es',
    icons: [
      {
        src:     '/icon.svg',
        sizes:   'any',
        type:    'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'no-cache');
  return res.status(200).json(manifest);
};
