// tests/stress.js
// Prueba de estrés: lleva el sistema más allá de su capacidad normal.
// Busca el punto de quiebre: a partir de cuántos usuarios el sistema empieza a fallar o degradarse.
// Los thresholds son más permisivos que en load porque se espera cierta degradación.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { recordMetrics } from '../utils/metrics.js';
import { generarReporte } from '../utils/report.js';

export const options = {
  stages: [
    { duration: '30s', target: 50  },
    { duration: '1m',  target: 50  },
    { duration: '30s', target: 100 },
    { duration: '1m',  target: 100 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 0   },
  ],

  thresholds: {
    http_req_duration:            ['p(95)<2000', 'p(99)<3000'],
    http_req_failed:              ['rate<0.05'],
    http_reqs:                    ['count>500'],
    custom_check_pass_rate:       ['rate>0.95'],
    custom_success_rate:          ['rate>0.95'],
    custom_request_duration_ms:   ['p(95)<2000', 'avg<1500'],
    custom_time_to_first_byte_ms: ['p(95)<1500'],
    custom_server_error_count:    ['count<50'],
  },
};

export default function () {
  const res = http.get('https://api.escuelajs.co/api/v1/products');

  const passed = check(res, {
    'status 200':              (r) => r.status === 200,
    'sin error de servidor':   (r) => r.status < 500,
    'responde en menos de 2s': (r) => r.timings.duration < 2000,
    'body no está vacío':      (r) => r.body && r.body.length > 0,
  });

  recordMetrics(res, passed);
  sleep(1);
}

export function handleSummary(data) {
  return generarReporte(data, 'stress');
}
