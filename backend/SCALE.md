# HustleX — Million-User Production Guide

Application layer is **finalized**. Deploy infrastructure for real traffic.

## Local scale stack (Windows)

Double-click **`start-scale.bat`** at project root, or:

```bash
cd backend
npm run scale:redis    # Terminal 1 — Redis
npm run dev:stable     # Terminal 2 — API
npm run worker         # Terminal 3 — background jobs
npm run dev            # Terminal 4 — frontend (from root)
```

One-shot setup + verify:

```bash
cd backend
npm run scale:finalize   # creates indexes + readiness report
```

## Cloud deploy (Docker)

```bash
cd backend
cp .env.production.example .env   # fill AWS + Atlas values
npm run scale:prod
# Scale horizontally:
docker compose -f docker-compose.prod.yml up -d --scale api=3 --scale worker=2
```

Or use `backend/k8s/` and `backend/terraform/` for AWS/Kubernetes.

## What's enabled

| Feature | Env |
|---------|-----|
| Shared rate limits & cache | `REDIS_ENABLED=true` |
| Async email & notifications | `QUEUE_ENABLED=true` + worker |
| Non-blocking chat | `MESSAGE_ASYNC=true` + worker |
| Multi-pod WebSockets | `REDIS_URL` + Socket.IO Redis adapter |
| Uploads across pods | `S3_ENABLED=true` + `CDN_URL` |
| Paginated APIs | `?page=1&limit=50` |
| DB indexes | `npm run scale:indexes` (50 indexes) |
| Health & metrics | `/api/health/detailed`, `/metrics` |

## Deploy topology

```
Users → CloudFront (CDN) → ALB/nginx
              ├── API × N  (stateless)
              ├── Worker × M
              ├── Redis cluster
              └── MongoDB Atlas (replica set / sharded)
S3 ← uploads
SES ← email at scale
```

## Capacity

| Tier | Setup |
|------|--------|
| **10k–50k** | 2 API pods, 1 worker, Atlas M10, Redis |
| **100k–500k** | 5–15 API pods, 4 workers, Atlas M30+, Redis cluster |
| **1M+ DAU** | 20–50 API pods, 10+ workers, sharded Atlas, SES, load tests |

## Launch checklist

- [x] `SCALE_MODE=production` in `.env`
- [x] Redis + worker (local: embedded Redis via `npm run scale:redis`)
- [x] `npm run scale:indexes` on production DB
- [ ] S3 bucket + CDN (`S3_ENABLED=true`, AWS keys)
- [ ] SES verified domain (`EMAIL_PROVIDER=ses`)
- [ ] Load test: jobs list, login, WebSocket messages
- [ ] Monitoring on `/metrics` and `/api/health/detailed`

## Verify

- `GET /api/health/detailed` — Mongo, Redis, queue stats
- `GET /metrics` — Prometheus (K8s HPA)
