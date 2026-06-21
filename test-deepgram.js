const https = require('https');

const apiKey = 'a2a7e6302774df3fa0da4dc045a7d1a9b801247e';
const audioUrl = 'https://dpgr.am/spacewalk.wav'; // Deepgram's official tester audio

const url = new URL(`https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true`);
const body = JSON.stringify({ url: audioUrl });

const req = https.request(
  {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('Success! Deepgram returned:', JSON.parse(data).results?.channels[0]?.alternatives[0]?.transcript.substring(0, 100) + '...');
      } else {
        console.error('Error Response:', data);
      }
    });
  }
);

req.on('error', (e) => console.error('Connection Error:', e));
req.write(body);
req.end();
