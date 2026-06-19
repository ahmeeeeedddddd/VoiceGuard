# VoiceGuard AI - Project Handoff

## 1. What We Did (Completed Scope)
We have successfully implemented **Epic 2: Core Auditing Engine** and **Story 4.2: Real-time Compliance Alerts Dashboard**.

**Features Completed:**
- **Infrastructure:** Set up a Turborepo monorepo with `apps/api` (NestJS) and `apps/web` (Next.js), backed by Dockerized PostgreSQL (database) and Redis (queues & pub/sub).
- **Ingestion (Story 2.1):** A `/ingestion/webhook` endpoint that accepts incoming call payloads, normalizes them, stores them in PostgreSQL, and enqueues a background job using BullMQ. Duplicate calls are ignored via Redis deduplication.
- **Transcription Integration (Story 2.2):** A Background `TranscriptionProcessor` worker that asynchronously sends audio URLs to Deepgram's API, receives the word-level transcript, and updates the database.
- **Automated Validation (Story 2.3):** A `ValidationProcessor` worker that analyzes the transcript text to verify compliance. If compliance rules are violated (e.g., missing mandatory greetings), the risk score is lowered and the status is flagged as `NEEDS_REVIEW` with `HIGH` risk.
- **Real-time Web Dashboard (Story 4.2):** A WebSocket Gateway in the API that broadcasts live status updates. The Next.js dashboard (`/dashboard`) listens to these events via `socket.io-client` and displays incoming calls and critical `HIGH RISK` alerts in a live call ticker UI.

## 2. What Is Remaining
The rest of the Epics are still untouched per our scope constraint:
- **Epic 1: Authentication & RBAC:** User login, JWTs, role-based access.
- **Epic 3: Audit Workspace:** The detailed drill-down UI (`/workspace/[id]`) where QA agents can listen to the audio player, read the highlighted transcript, and override automated scoring.
- **Epic 4: Advanced Dashboard:** Aggregate metrics, charts, and historical reporting.
- **Epic 5: Integration:** S3 bucket polling for audio file drops, CRMs, etc.

## 3. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Docker Desktop
- A valid Deepgram API Key

### Setup Steps
1. Clone the repository.
2. Start the databases:
   ```bash
   docker-compose up -d
   ```
3. Install dependencies from the root directory:
   ```bash
   npm install
   ```
4. Configure your environment. In `apps/api/.env`, ensure you have:
   ```env
   DEEPGRAM_API_KEY=your_key_here
   WEBHOOK_SECRET=test-secret
   ```
5. Start the full application (this runs both API and Web in parallel via Turborepo):
   ```bash
   npx turbo run dev
   ```

### Testing the Pipeline
Open your browser to `http://localhost:3000/dashboard`.
In another terminal, run our webhook simulation script with any public audio URL:
```bash
node scripts/test-webhook.mjs "https://your-public-audio-url.mp3"
```
You will instantly see the ingestion and alert pop up on the dashboard.

## 4. Project Structure
We are using a Monorepo architecture managed by Turborepo:
- `apps/api/`: NestJS backend. Contains the Webhook controllers, TypeORM database entities, STT providers, BullMQ processors, and WebSocket gateways.
- `apps/web/`: Next.js frontend frontend using TailwindCSS and Socket.io client.
- `libs/shared/`: Shared TypeScript interfaces and DTOs used by both the API and Web.
- `docker-compose.yml`: Defines `postgres` and `redis` containers for local development.
- `postgres-data/`: Ignored volume map ensuring database persists across reboots.
- `scripts/`: Contains the `test-webhook.mjs` script for E2E testing.
