const http = require('http');

const rules = [
  { name: 'Greeting Check', description: 'Did the agent introduce themselves?', requiredPhrase: 'name is', category: 'Greeting' },
  { name: 'Booking Process', description: 'Did the agent collect the email?', requiredPhrase: 'email', category: 'Process' },
  { name: 'Closing Check', description: 'Did the agent thank the customer?', requiredPhrase: 'thank you', category: 'Closing' }
];

async function seed() {
  for (const r of rules) {
    await new Promise((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 3001,
          path: '/audit/checklist-rules',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => resolve(res)
      );
      req.write(JSON.stringify(r));
      req.end();
    });
  }
  console.log("Database seeded successfully!");
}
seed();
