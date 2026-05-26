const path = require('path');
const fs   = require('fs');
 
let clients = {};
try {
  clients = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'clients.json'), 'utf8')
  );
} catch (e) {
  console.warn('clients.json not found:', e.message);
}
 
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });
 
  const { name, phone, clientId } = req.body || {};
 
  if (!name || !phone || !clientId) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
 
  const client = clients[clientId];
  if (!client) {
    return res.status(404).json({ error: 'Cliente no configurado.' });
  }
 
  const apiKey = process.env['GHL_KEY_' + clientId.toUpperCase().replace(/-/g, '_')]
              || client.apiKey;
 
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key no configurada.' });
  }
 
  const parts     = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName  = parts.slice(1).join(' ') || '';
 
  try {
    const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method:  'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Version':       '2021-07-28',
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        locationId: client.locationId
      })
    });
 
    const data = await ghlRes.json();
 
    if (ghlRes.ok) {
      return res.status(200).json({ success: true, contactId: data.contact?.id || null });
    }
 
    console.error('GHL error:', data);
    return res.status(400).json({ error: data?.message || 'Error del CRM.' });
 
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Error de conexión. Inténtalo de nuevo.' });
  }
};
