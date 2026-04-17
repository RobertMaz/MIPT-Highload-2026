import http from 'k6/http';
import { check, sleep } from 'k6';

// Smoke test: "вообще работает?" 5 VU, 30 секунд.
export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  const res = http.get(`${BASE}/api/customer/owners`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'has owners': (r) => r.json().length > 0,
  });
  sleep(1);
}
