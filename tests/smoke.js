// tests/smoke.js
// Prueba de humo: verifica que la API esté viva y respondiendo antes de correr pruebas más pesadas.
// Se usa después de un deploy o como punto de partida del ciclo de pruebas.
// Es rápida por diseño: 1 usuario, 5 requests, nada más.

import http from 'k6/http';
import { check } from 'k6';
import { recordMetrics } from '../utils/metrics.js';
import { generarReporte } from '../utils/report.js';

export const options = {
  vus: 1,
  iterations: 5,

  thresholds: {
    http_req_duration:          ['p(95)<1000'],
    http_req_failed:            ['rate<0.01'],
    custom_check_pass_rate:     ['rate>0.99'],
    custom_success_rate:        ['rate>0.99'],
    custom_request_duration_ms: ['p(95)<1000'],
  },
};

export default function () {
  const res = http.get('https://api.escuelajs.co/api/v1/products');

  const passed = check(res, {
    'status 200':              (r) => r.status === 200,
    'responde en menos de 1s': (r) => r.timings.duration < 1000,
    'body no está vacío':      (r) => r.body && r.body.length > 0,
    'content-type es JSON':    (r) => r.headers['Content-Type'] &&
                                       r.headers['Content-Type'].includes('application/json'),
  });

  recordMetrics(res, passed);
}

// k6 llama a esta función automáticamente al terminar el test
// y escribe los archivos que retornemos (HTML + JSON)
export function handleSummary(data) {
  return generarReporte(data, 'smoke');
}
