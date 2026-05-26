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
 
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
 
  const { id } = req.query;
  if (!id || !clients[id]) {
    return res.status(404).json({ error: 'Not found' });
  }
 
  const c = clients[id];
  return res.status(200).json({
    name:        c.name        || 'Mi Negocio',
    countryCode: c.countryCode || '+34'
  });
};
