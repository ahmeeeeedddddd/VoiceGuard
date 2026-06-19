SELECT "externalId", "status", "riskLevel", transcript->>'fullText' as transcript_text FROM call_records ORDER BY "createdAt" DESC LIMIT 1;
