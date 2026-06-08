const QRCode = require('/tmp/qrgen/node_modules/qrcode');
const path = require('path');
const out = path.join('C:', 'Users', 'Genesis', 'Desktop', 'expo-connect-qr.png');
QRCode.toFile(out, 'exp://192.168.101.87:8081', { width: 500, margin: 2 }, (err) => {
  if (err) { console.error('ERR', err); process.exit(1); }
  console.log('QR saved to', out);
});
