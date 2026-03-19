// tests/spike.js
// Prueba de pico: simula un aumento repentino y masivo de usuarios en pocos segundos.
// Casos reales: una promoción viral, un link en redes sociales, un evento en vivo.
// Lo importante no es solo si sobrevive el pico, sino qué tan rápido se recupera después.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { recordMetrics } from '../utils/metrics.js';
import { generarReporte } from '../utils/report.js';

export const options = {
  stages: [
    { duration: '10s', target: 5   },
    { duration: '10s', target: 200 },
    { duration: '1m',  target: 200 },
    { duration: '10s', target: 5   },
    { duration: '30s', target: 5   },
    { duration: '10s', target: 0   },
  ],

  thresholds: {
    http_req_duration:            ['p(95)<3000'],
    http_req_failed:              ['rate<0.10'],
    custom_check_pass_rate:       ['rate>0.90'],
    custom_success_rate:          ['rate>0.90'],
    custom_request_duration_ms:   ['p(95)<3000', 'avg<2000'],
    custom_time_to_first_byte_ms: ['p(95)<2500'],
    custom_server_error_count:    ['count<100'],
  },
};

export default function () {
  const res = http.get('https://api.escuelajs.co/api/v1/products');

  const passed = check(res, {
    'status 200':              (r) => r.status === 200,
    'sin error de servidor':   (r) => r.status < 500,
    'responde en menos de 3s': (r) => r.timings.duration < 3000,
    'body no está vacío':      (r) => r.body && r.body.length > 0,
  });

  recordMetrics(res, passed);
  sleep(1);
}

export function handleSummary(data) {
  return generarReporte(data, 'spike');
}
