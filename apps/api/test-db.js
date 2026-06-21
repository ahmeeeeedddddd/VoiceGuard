require('ts-node/register'); // enable TS import in node
const { DataSource } = require('typeorm');
const { CallRecordEntity } = require('./src/database/call-record.entity');

const ds = new DataSource({
  type: 'postgres',
  host: '127.0.0.1', port: 5434, username: 'voiceguard_user', password: 'voiceguard_password', database: 'voiceguard_db',
  entities: [CallRecordEntity],
});
ds.initialize().then(async () => {
  const repo = ds.getRepository(CallRecordEntity);
  const calls = await repo.find({
    order: { createdAt: 'DESC' },
    take: 3,
  });
  console.log("Recent calls:");
  for (const c of calls) {
    console.log(`- ${c.externalId} | Status: ${c.status} | Transcript: ${c.transcript ? 'YES' : 'NO'}`);
  }
  ds.destroy();
}).catch(console.error);
