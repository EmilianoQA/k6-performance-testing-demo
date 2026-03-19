// tests/soak.js
// Prueba de resistencia: misma carga que el load test, pero sostenida durante mucho tiempo.
// Detecta problemas que solo aparecen con el uso prolongado: memory leaks,
// conexiones que no se cierran, degradación lenta del tiempo de respuesta.
// Esta versión dura 10 minutos. En producción real se corre entre 1 y 8 horas.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { recordMetrics } from '../utils/metrics.js';
import { generarReporte } from '../utils/report.js';

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '6m', target: 20 },
    { duration: '2m', target: 0  },
  ],

  thresholds: {
    http_req_duration:               ['p(95)<1000', 'p(99)<1500'],
    http_req_failed:                 ['rate<0.02'],
    http_reqs:                       ['count>1000'],
    custom_check_pass_rate:          ['rate>0.98'],
    custom_success_rate:             ['rate>0.98'],
    custom_request_duration_ms:      ['p(95)<1000', 'avg<600'],
    custom_time_to_first_byte_ms:    ['p(95)<800'],
    custom_response_body_size_bytes: ['value>0'],
    custom_server_error_count:       ['count<20'],
  },
};

export default function () {
  const res = http.get('https://api.escuelajs.co/api/v1/products');

  const passed = check(res, {
    'status 200':              (r) => r.status === 200,
    'responde en menos de 1s': (r) => r.timings.duration < 1000,
    'TTFB menor a 800ms':      (r) => r.timings.waiting < 800,
    'body no está vacío':      (r) => r.body && r.body.length > 0,
    'content-type es JSON':    (r) => r.headers['Content-Type'] &&
                                       r.headers['Content-Type'].includes('application/json'),
  });

  recordMetrics(res, passed);
  sleep(1);
}

export function handleSummary(data) {
  return generarReporte(data, 'soak');
}
