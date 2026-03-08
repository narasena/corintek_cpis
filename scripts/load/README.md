# Phase 5: Load Testing & Performance Validation

This directory contains load testing scripts to validate the caching layer performance under realistic traffic patterns.

## Prerequisites

- Install [k6](https://k6.io/docs/getting-started/installation/)
- Have a running instance of CPIS (development or staging) accessible via HTTP
- Obtain test user credentials with appropriate permissions (admin role recommended)

## Configuration

Set the following environment variables before running:

| Variable        | Description                           | Default (if unset)      |
| --------------- | ------------------------------------- | ----------------------- |
| `BASE_URL`      | Target application URL                | `http://localhost:3000` |
| `TEST_EMAIL`    | Email for test user login             | `test@example.com`      |
| `TEST_PASSWORD` | Password for test user login          | `password`              |
| `VUS`           | Number of virtual users (concurrency) | `10`                    |
| `DURATION`      | Test duration (e.g., `5m`, `30s`)     | `5m`                    |

## What It Tests

The script exercises the following read-heavy server actions (all cached):

- `getProjectsAction`
- `getDashboardProjectsAction`
- `getDashboardMetricsAction`
- `getAllClientsAction`
- `getAllUsersAction`
- `getParametersAction`

Each virtual user randomly selects an action every second, simulating real user navigation.

## Running the Test

```bash
# Basic run (10 VUs for 5 minutes)
k6 run scripts/load/k6.js

# Custom configuration
BASE_URL=https://staging.corintek.com \
TEST_EMAIL=loadtester@example.com \
TEST_PASSWORD=yourpassword \
VUS=25 \
DURATION=10m \
k6 run scripts/load/k6.js
```

## Metrics Collected

- **Custom Metrics** (emitted by the application via `NEXT_PUBLIC_CACHE_METRICS=true`):
  - Cache hits/misses/errors per tag (logged to server console)
- **k6 Metrics**:
  - `errors` — rate of failed requests (non-200 or `success: false`)
  - `http_req_duration` — request latency distribution (p50, p95, p99)
- All metrics are printed to stdout at the end of the run.

## Success Criteria

| Metric                    | Target                             |
| ------------------------- | ---------------------------------- |
| Error rate                | < 10%                              |
| 95th percentile latency   | < 1000ms (1s)                      |
| Cache hit rate (observed) | > 70% for heavily cached endpoints |

## Post-Test Analysis

1. Check k6 summary for error rates and latency.
2. Inspect the application server logs for cache metrics (JSON lines with `level: "CACHE"`). Aggregate hit/miss counts manually or with log parsing tools.
3. Verify deduplication: In high-concurrency scenarios, multiple simultaneous requests for the same data should result in fewer underlying service calls (observe via logs or DB query stats).
4. Review TTL effectiveness: Are hit rates consistent, or do we see many expirations causing DB spikes? Adjust `CACHE_LIFE` profiles accordingly.

## Troubleshooting

- **All requests failing (401/403)**: Ensure the test user exists and has required roles (admin or appropriate access). Check that `/api/auth/login` works with provided credentials.
- **Connection refused**: Verify `BASE_URL` is correct and the server is running.
- **No cache metrics in logs**: Confirm `NEXT_PUBLIC_CACHE_METRICS=true` is set on the server environment.
