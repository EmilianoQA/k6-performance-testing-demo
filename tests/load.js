// tests/load.js
// Prueba de carga: simula el tráfico normal esperado del sistema.
// El objetivo es confirmar que la API responde bien bajo condiciones habituales de uso.
// Estructura: subida gradual → carga sostenida → bajada gradual.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { recordMetrics } from '../utils/metrics.js';
import { generarReporte } from '../utils/report.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m',  target: 20 },
    { duration: '30s', target: 0  },
  ],

  thresholds: {
    http_req_duration:               ['p(95)<800', 'p(99)<1200'],
    http_req_failed:                 ['rate<0.02'],
    http_reqs:                       ['count>100'],
    custom_check_pass_rate:          ['rate>0.98'],
    custom_success_rate:             ['rate>0.98'],
    custom_request_duration_ms:      ['p(95)<800', 'avg<500'],
    custom_time_to_first_byte_ms:    ['p(95)<600'],
    custom_response_body_size_bytes: ['value>0'],
  },
};

export default function () {
  const res = http.get('https://api.escuelajs.co/api/v1/products');

  const passed = check(res, {
    'status 200':                 (r) => r.status === 200,
    'responde en menos de 800ms': (r) => r.timings.duration < 800,
    'body no está vacío':         (r) => r.body && r.body.length > 0,
    'TTFB menor a 600ms':         (r) => r.timings.waiting < 600,
    'conexión menor a 200ms':     (r) => r.timings.connecting < 200,
  });

  recordMetrics(res, passed);
  sleep(1);
}

export function handleSummary(data) {
  return generarReporte(data, 'load');
}
