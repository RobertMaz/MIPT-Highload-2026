import http from 'k6/http';
import { check, sleep } from 'k6';

// Load test: реалистичная нагрузка с паузами. 200 VU reads + 40 VU writes, со sleep.
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
        { duration: '30s', target: 200 },
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
        { duration: '30s', target: 40 },
        { duration: '15s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:8080';

// 80% трафика: reads с паузами
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
  sleep(1 + Math.random() * 2); // 1-3 сек — пауза между запросами
}

// 20% трафика: writes с паузами
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
  sleep(2 + Math.random() * 3); // 2-5 сек — writes реже
}
