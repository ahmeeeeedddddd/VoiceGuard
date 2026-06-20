/**
 * Seeds the checklist_rules table with sample compliance rules for testing.
 * Run with: node scripts/seed-rules.mjs
 */

import http from 'http';

const rules = [
  { requiredPhrase: 'thank you for calling', isCriticalFail: false, points: 10, category: 'GREETING' },
  { requiredPhrase: 'my name is', isCriticalFail: false, points: 10, category: 'GREETING' },
  { requiredPhrase: 'how can I help you', isCriticalFail: false, points: 10, category: 'GREETING' },
  { requiredPhrase: 'this call may be recorded', isCriticalFail: true, points: 30, category: 'COMPLIANCE' },
  { requiredPhrase: 'is there anything else', isCriticalFail: false, points: 10, category: 'CLOSING' },
  { requiredPhrase: 'have a great day', isCriticalFail: false, points: 10, category: 'CLOSING' },
];

async function postRule(rule) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rule);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/audit/checklist-rules',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-mock-role': 'ADMIN',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

console.log('🌱 Seeding checklist rules...\n');
for (const rule of rules) {
  try {
    const result = await postRule(rule);
    if (result.status === 201 || result.status === 200) {
      console.log(`✅ Seeded: "${rule.requiredPhrase}" (${rule.points}pts, critical: ${rule.isCriticalFail})`);
    } else {
      console.log(`⚠️  Status ${result.status} for "${rule.requiredPhrase}": ${result.body}`);
    }
  } catch (err) {
    console.error(`❌ Failed to seed "${rule.requiredPhrase}":`, err.message);
  }
}
console.log('\n✅ Done! Rules are now in the database.');
