import http from 'k6/http';
import { check } from 'k6';

// Stress test: ищем потолок. Без think time, step ramp. ~2.5 мин.
export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      exec: 'browseScenario',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '15s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '15s', target: 200 },
        { duration: '90s', target: 200 },
        { duration: '15s', target: 0 },
      ],
    },
    writes: {
      executor: 'ramping-vus',
      exec: 'writeScenario',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '15s', target: 20 },
        { duration: '30s', target: 20 },
        { duration: '15s', target: 40 },
        { duration: '90s', target: 40 },
        { duration: '15s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.20'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:8080';

// 80% трафика: reads
export function browseScenario() {
  const roll = Math.random();
  let res;

  if (roll < 0.4) {
    res = http.get(`${BASE}/api/customer/owners`);
  } else if (roll < 0.7) {
    const id = Math.floor(Math.random() * 10) + 1;
    res = http.get(`${BASE}/api/customer/owners/${id}`);
  } else if (roll < 0.85) {
    const id = Math.floor(Math.random() * 10) + 1;
    res = http.get(`${BASE}/api/gateway/owners/${id}`);
  } else {
    res = http.get(`${BASE}/api/vet/vets`);
  }

  check(res, { 'read ok': (r) => r.status === 200 });
}

// 20% трафика: writes (POST visits — межсервисный write)
export function writeScenario() {
  const ownerId = Math.floor(Math.random() * 10) + 1;
  const petId = 1;
  const payload = JSON.stringify({
    date: '2025-04-16',
    description: `Load test visit ${Date.now()}`,
  });
  const res = http.post(
    `${BASE}/api/visit/owners/${ownerId}/pets/${petId}/visits`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, { 'write ok': (r) => r.status === 201 || r.status === 200 });
}
