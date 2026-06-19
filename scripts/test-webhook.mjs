/**
 * VoiceGuard AI — Webhook E2E Test Script
 * ----------------------------------------
 * This script simulates an external telephony system pushing a call recording
 * to the VoiceGuard ingest endpoint.
 *
 * Usage:
 *   node scripts/test-webhook.mjs [optional_audio_url]
 *
 * Example:
 *   node scripts/test-webhook.mjs https://my-custom-server.com/my-recording.mp3
 *
 * Requirements:
 *   - The API must be running on http://localhost:3001
 *   - The WEBHOOK_SECRET must match what's in your API's env (defaults to "test-secret")
 */

import crypto from 'crypto';
import https from 'http';

const API_URL = 'http://localhost:3001';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test-secret';

// Get custom audio URL from command line argument, or use the default
const customAudioUrl = process.argv[2];
const defaultAudioUrl = 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3';

// Simulate a call payload from an external dialer
const payload = {
  externalCallId: `call-${Date.now()}`,
  agentId: 'agent-42',
  audioUrl: customAudioUrl || defaultAudioUrl,
  metadata: {
    callDurationSeconds: 145,
    source: 'dialer-acme-v2',
  },
};

const bodyString = JSON.stringify(payload);

// Compute HMAC-SHA256 signature (matches WebhookSignatureGuard logic)
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(bodyString)
  .digest('hex');

console.log('─────────────────────────────────────────');
console.log('🎙️  VoiceGuard Webhook Test');
console.log('─────────────────────────────────────────');
console.log(`📦 Payload:      ${JSON.stringify(payload, null, 2)}`);
console.log(`🔑 Signature:    ${signature}`);
console.log(`📡 Sending to:   POST ${API_URL}/ingestion/webhook`);
console.log('─────────────────────────────────────────');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/ingestion/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyString),
    'x-voiceguard-signature': signature,
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(`\n✅ Response Status: ${res.statusCode}`);
    console.log(`📋 Response Body:  ${JSON.stringify(parsed, null, 2)}`);
    console.log('\n👁️  Now check your VoiceGuard Dashboard at http://localhost:3000/dashboard');
    console.log('   You should see a "📞 Call Ingested" alert appear in the Live Call Ticker!');
    if (res.statusCode === 200 && parsed.status === 'INGESTED') {
      console.log('\n⚠️  This call was a DUPLICATE (already ingested).');
    }
  });
});

req.on('error', (err) => {
  console.error(`\n❌ Failed to reach the API: ${err.message}`);
  console.error('   Make sure the API is running: cd apps/api && npm run start:dev');
});

req.write(bodyString);
req.end();
