import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// ============================================================================
// Metrics
// ============================================================================
export const errorRate = new Rate('errors');

// ============================================================================
// Configuration (set via environment variables)
// ============================================================================
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'password';
const VUS = parseInt(__ENV.VUS || '10');
const DURATION = __ENV.DURATION || '5m';

// ============================================================================
// Test Scenarios
// ============================================================================
const ACTIONS = [
  '/_actions/getProjectsAction',
  '/_actions/getDashboardProjectsAction',
  '/_actions/getDashboardMetricsAction',
  '/_actions/getAllClientsAction',
  '/_actions/getAllUsersAction',
  '/_actions/getParametersAction',
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Perform login and extract session cookie.
 * Uses URL-encoded form body as accepted by Next.js server actions.
 */
function obtainSessionCookie() {
  const url = BASE_URL + '/_actions/loginAction';

  const payload = `email=${encodeURIComponent(TEST_EMAIL)}&password=${encodeURIComponent(TEST_PASSWORD)}`;

  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (res.status !== 200) {
    console.error(`Login failed with status ${res.status}: ${res.body}`);
    return '';
  }

  const setCookie = res.headers['Set-Cookie'];
  if (!setCookie || !setCookie[0]) {
    console.error('No Set-Cookie header received in login response');
    return '';
  }

  const cookieParts = setCookie[0].split(';');
  const authCookie = cookieParts.find(part =>
    part.trim().startsWith('auth_token=')
  );
  return authCookie ? authCookie.trim() : '';
}

/**
 * Call a server action with optional session cookie.
 */
function callAction(actionPath, cookie = '') {
  const url = BASE_URL + actionPath;
  const headers = {};
  if (cookie) {
    headers.Cookie = cookie;
  }

  const res = http.post(url, JSON.stringify({}), { headers });
  return res;
}

/**
 * Pick a random action from the test set.
 */
function randomAction() {
  return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
}

// ============================================================================
// k6 Lifecycle
// ============================================================================

/**
 * Setup runs once before VUs start. Obtain session cookie for authenticated requests.
 */
export function setup() {
  console.log('Setting up load test: logging in to obtain session cookie...');
  const cookie = obtainSessionCookie();
  if (!cookie) {
    console.warn(
      'No session cookie obtained; requests will be unauthenticated and likely fail'
    );
  } else {
    console.log('Session cookie obtained successfully');
  }
  return { cookie };
}

/**
 * Default is the main load test function executed by each VU.
 */
export default function (data) {
  const { cookie } = data;
  const action = randomAction();

  try {
    const res = callAction(action, cookie);

    const ok = check(res, {
      'status is 2xx': r => r.status >= 200 && r.status < 300,
    });

    errorRate.add(!ok);
  } catch (err) {
    errorRate.add(1);
    console.error('Request exception:', err);
  }

  sleep(1);
}

// ============================================================================
// k6 Options
// ============================================================================
export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    errors: ['rate<0.1'], // less than 10% errors
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
  },
};
