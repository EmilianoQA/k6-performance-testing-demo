// utils/metrics.js
// Métricas personalizadas compartidas por todos los escenarios de prueba.
// Están centralizadas acá para no repetir código en cada archivo.

import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

// --- COUNTERS ---
// Cuentan cuántas veces ocurrió algo durante toda la prueba. Solo suben.

// Cuántos requests terminaron con status 200
export const successCount = new Counter('custom_success_count');

// Cuántos requests devolvieron error del cliente (4xx)
export const clientErrorCount = new Counter('custom_client_error_count');

// Cuántos requests devolvieron error del servidor (5xx)
export const serverErrorCount = new Counter('custom_server_error_count');


// --- GAUGE ---
// Captura un valor puntual que puede subir o bajar. Refleja el último valor registrado.

// Peso del body de la respuesta en bytes
export const responseBodySize = new Gauge('custom_response_body_size_bytes');


// --- RATES ---
// Miden el porcentaje de valores que son "verdaderos" sobre el total.

// Qué porcentaje de requests pasaron todos los checks
export const checkPassRate = new Rate('custom_check_pass_rate');

// Qué porcentaje de requests devolvieron status 200
export const successRate = new Rate('custom_success_rate');


// --- TRENDS ---
// Recopilan valores numéricos y calculan estadísticas: min, max, promedio, percentiles.
// El segundo parámetro `true` activa mayor precisión en los percentiles.

// Duración total del request de punta a punta
export const requestDuration = new Trend('custom_request_duration_ms', true);

// Tiempo hasta recibir el primer byte del servidor (TTFB)
export const timeToFirstByte = new Trend('custom_time_to_first_byte_ms', true);

// Tiempo que tardó en establecerse la conexión TCP
export const connectionTime = new Trend('custom_connection_time_ms', true);


// --- FUNCIÓN HELPER ---
// Registra todas las métricas de una sola vez.
// Así los archivos de test quedan limpios y no repiten esta lógica.

export function recordMetrics(res, passed) {
  const status = res.status;

  if (status === 200)                      successCount.add(1);
  else if (status >= 400 && status < 500)  clientErrorCount.add(1);
  else if (status >= 500)                  serverErrorCount.add(1);

  responseBodySize.add(res.body ? res.body.length : 0);

  successRate.add(status === 200);
  checkPassRate.add(passed);

  requestDuration.add(res.timings.duration);
  timeToFirstByte.add(res.timings.waiting);
  connectionTime.add(res.timings.connecting);
}
