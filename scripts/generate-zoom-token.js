const crypto = require('crypto');

// Usage:
// ZOOM_CLIENT_ID=... ZOOM_CLIENT_SECRET=... node scripts/generate-zoom-token.js
// Optional overrides:
// ZOOM_MEETING_NUMBER=7075120473 ZOOM_ROLE=0 ZOOM_TOKEN_TTL_SECONDS=172800

const CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const MEETING_NUMBER = process.env.ZOOM_MEETING_NUMBER || '7075120473';
const ROLE = Number(process.env.ZOOM_ROLE || 0);
const TOKEN_TTL_SECONDS = Number(process.env.ZOOM_TOKEN_TTL_SECONDS || 60 * 60 * 48);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing required env vars: ZOOM_CLIENT_ID and/or ZOOM_CLIENT_SECRET');
  process.exit(1);
}

const iat = Math.floor(Date.now() / 1000);
const exp = iat + TOKEN_TTL_SECONDS;

// Keep strict key order to avoid Zoom SDK credential validation issues.
const header = '{"typ":"JWT","alg":"HS256"}';
const encodedHeader = Buffer.from(header).toString('base64url');

const payload = JSON.stringify({
  appKey: CLIENT_ID,
  sdkKey: CLIENT_ID,
  mn: MEETING_NUMBER,
  role: ROLE,
  iat,
  exp,
  tokenExp: exp,
});
const encodedPayload = Buffer.from(payload).toString('base64url');

const signatureInput = `${encodedHeader}.${encodedPayload}`;
const signature = crypto.createHmac('sha256', CLIENT_SECRET).update(signatureInput).digest('base64url');

const jwt = `${signatureInput}.${signature}`;

console.log('\n--- Zoom Meeting SDK JWT ---\n');
console.log(jwt);
console.log('\n----------------------------\n');
console.log(`iat=${iat}`);
console.log(`exp=${exp}`);
