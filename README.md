# Payment Retry Status Service

## What is this?
This is a small backend system built to understand how payments behave when things do not go smoothly.

In real systems, requests fail, networks time out, and clients retry. This project focuses on handling those situations safely so that:
- A payment is processed only once.
- Retries do not create duplicates.
- The system eventually reaches a clear final state.

It is intentionally small and simple.

## Why retries are tricky
Retries sound easy, but they are usually where systems break.

If you retry carelessly, you can:
- Charge the user twice.
- Write the same data multiple times.
- Leave payments stuck in an unknown state.

To avoid this, you need:
- Explicit states.
- Idempotency.
- Strict rules about when a state can change.

That is what this project explores.

## How idempotency works here
Each payment request uses an idempotency key.

If the same request is sent again with the same key:
- The system returns the same payment.
- No new row is created.
- No duplicate processing happens.

This makes retries safe from the client side.

## Payment lifecycle
Payment states are defined in `backend/src/config/constants.js`:
- CREATED
- PROCESSING
- SUCCESS (terminal)
- FAILED (terminal)

Flow:
- A payment starts as CREATED.
- It immediately moves to PROCESSING.
- Retries simulate downstream behavior.
- A randomly selected retry attempt (1 to MAX_RETRY_ATTEMPTS) resolves the payment to SUCCESS or FAILED.
- Terminal states cannot be changed once reached.

## Retry strategy
- Only payments in PROCESSING can be retried.
- Every retry attempt is recorded in `payment_retries`.
- Retries are capped by MAX_RETRY_ATTEMPTS.
- Attempts before the resolve attempt are treated as TIMEOUT.
- The resolve attempt sets the final state.

## API endpoints
- POST `/payments` - create payment (idempotent)
- GET `/payments/:id` - get payment status
- POST `/payments/:id/retry` - trigger a retry (demo/debug)
- GET `/payments` - list payments (UI/debug)
- GET `/payments/:id/retries` - view retry history
- DELETE `/payments/:id` - cleanup (demo only)

## How to run locally
### Backend
Create a PostgreSQL database and apply the schema:
```sh
psql $DATABASE_URL -f backend/src/db/schema.sql
```

Copy env file:
```sh
cp backend/.env.example backend/.env
```

Install and run:
```sh
cd backend
npm install
npm run dev
```

### Frontend
Install and run:
```sh
cd frontend
npm install
npm run dev
```

## Demo flow (Postman or UI)
- Create a payment with an idempotency key.
- Send the same request again and confirm the same payment ID.
- Trigger retries.
- Observe the payment stay in PROCESSING until it resolves.
- View retry history and final state.

## What this demo proves
- Duplicate requests do not create duplicate payments.
- Failures do not corrupt state.
- Terminal states are written once and never changed.
- Retry behavior is visible and controlled.

## What this project is NOT trying to do
- Authentication
- External payment APIs
- Queues or message brokers
- Caching layers
- Microservices
- Production-grade UI

The goal is correctness and clarity, not completeness.

## Debug dashboard
The UI is a debug panel, not a product UI.

It shows:
- Payment states
- Retry counts
- Failure reasons

It is intentionally plain and internal-looking so state changes are obvious.

## Why it looks simple
- It is ugly on purpose.
- It exposes internals.
- It explains failures instead of hiding them.

That is how most real internal fintech tools look.
