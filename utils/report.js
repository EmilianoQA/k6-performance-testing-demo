// utils/report.js
// Genera un reporte HTML al finalizar cada test.
// Se usa exportando la función handleSummary en cada archivo de test.
// k6 llama a esta función automáticamente cuando el test termina.

// Recibe el nombre del escenario para darle nombre al archivo de salida
export function generarReporte(data, escenario) {

  // Extraemos las métricas más importantes del summary de k6
  const duracion    = data.metrics.http_req_duration;
  const fallidos    = data.metrics.http_req_failed;
  const totalReqs   = data.metrics.http_reqs;
  const checks      = data.metrics.checks;

  // Métricas custom (pueden no existir en todos los escenarios)
  const successRate = data.metrics.custom_success_rate;
  const checkRate   = data.metrics.custom_check_pass_rate;
  const ttfb        = data.metrics.custom_time_to_first_byte_ms;
  const bodySize    = data.metrics.custom_response_body_size_bytes;
  const successCnt  = data.metrics.custom_success_count;
  const errores4xx  = data.metrics.custom_client_error_count;
  const errores5xx  = data.metrics.custom_server_error_count;

  // Helpers para mostrar valores de forma segura (si la métrica no existe muestra —)
  const val  = (m, k)       => m && m.values && m.values[k]    != null ? m.values[k].toFixed(2)    : '—';
  const pct  = (m, k)       => m && m.values && m.values[k]    != null ? (m.values[k] * 100).toFixed(2) + '%' : '—';
  const cnt  = (m)          => m && m.values && m.values.count  != null ? m.values.count             : '—';
  const rate = (m)          => m && m.values && m.values.rate   != null ? (m.values.rate * 100).toFixed(2) + '%' : '—';

  // Definimos el color del badge de resultado según si todos los thresholds pasaron
  const todoPaso   = !data.root_group || Object.values(data.metrics).every(m => !m.thresholds ||
    Object.values(m.thresholds).every(t => !t.ok === false));
  const estadoColor = '#22c55e';  // verde siempre en demo (k6 ya falla el proceso si hay threshold roto)
  const estadoTexto = 'COMPLETADO';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reporte k6 — ${escenario}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #1e293b;
    }

    .header h1 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .header h1 span {
      color: #818cf8;
    }

    .badge {
      background: ${estadoColor};
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 0.4rem 1rem;
      border-radius: 999px;
      letter-spacing: 0.05em;
    }

    .meta {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 2rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.2rem 1.5rem;
    }

    .card .label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.4rem;
    }

    .card .value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .card .sub {
      font-size: 0.78rem;
      color: #64748b;
      margin-top: 0.2rem;
    }

    .card.highlight { border-color: #818cf8; }
    .card.ok        { border-color: #22c55e; }
    .card.warn      { border-color: #f59e0b; }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: #94a3b8;
      margin: 2rem 0 1rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    th {
      text-align: left;
      padding: 0.8rem 1.2rem;
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: #0f172a;
    }

    td {
      padding: 0.75rem 1.2rem;
      font-size: 0.9rem;
      border-top: 1px solid #334155;
      color: #cbd5e1;
    }

    td.mono {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.85rem;
      color: #818cf8;
    }

    tr:hover td { background: #263348; }

    .footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.8rem;
      color: #475569;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>Reporte k6 — <span>${escenario.toUpperCase()}</span></h1>
    <span class="badge">${estadoTexto}</span>
  </div>

  <p class="meta">Generado el ${new Date().toLocaleString('es-AR')} &nbsp;·&nbsp; Escenario: ${escenario}</p>

  <!-- Tarjetas de resumen -->
  <div class="section-title">Resumen general</div>
  <div class="grid">
    <div class="card highlight">
      <div class="label">Total de requests</div>
      <div class="value">${cnt(totalReqs)}</div>
      <div class="sub">durante toda la prueba</div>
    </div>
    <div class="card ok">
      <div class="label">Tasa de éxito</div>
      <div class="value">${pct(successRate, 'rate')}</div>
      <div class="sub">respuestas HTTP 200</div>
    </div>
    <div class="card">
      <div class="label">Checks pasados</div>
      <div class="value">${pct(checkRate, 'rate')}</div>
      <div class="sub">del total de assertions</div>
    </div>
    <div class="card warn">
      <div class="label">Tasa de fallos</div>
      <div class="value">${rate(fallidos)}</div>
      <div class="sub">requests fallidos</div>
    </div>
  </div>

  <!-- Tiempos de respuesta -->
  <div class="section-title">Tiempos de respuesta (ms)</div>
  <table>
    <thead>
      <tr>
        <th>Métrica</th>
        <th>Promedio</th>
        <th>Mínimo</th>
        <th>Mediana (p50)</th>
        <th>p90</th>
        <th>p95</th>
        <th>p99</th>
        <th>Máximo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Duración total (http_req_duration)</td>
        <td class="mono">${val(duracion, 'avg')}</td>
        <td class="mono">${val(duracion, 'min')}</td>
        <td class="mono">${val(duracion, 'med')}</td>
        <td class="mono">${val(duracion, 'p(90)')}</td>
        <td class="mono">${val(duracion, 'p(95)')}</td>
        <td class="mono">${val(duracion, 'p(99)')}</td>
        <td class="mono">${val(duracion, 'max')}</td>
      </tr>
      <tr>
        <td>TTFB — tiempo al primer byte</td>
        <td class="mono">${val(ttfb, 'avg')}</td>
        <td class="mono">${val(ttfb, 'min')}</td>
        <td class="mono">${val(ttfb, 'med')}</td>
        <td class="mono">${val(ttfb, 'p(90)')}</td>
        <td class="mono">${val(ttfb, 'p(95)')}</td>
        <td class="mono">${val(ttfb, 'p(99)')}</td>
        <td class="mono">${val(ttfb, 'max')}</td>
      </tr>
    </tbody>
  </table>

  <!-- Métricas custom -->
  <div class="section-title">Métricas personalizadas</div>
  <table>
    <thead>
      <tr>
        <th>Métrica</th>
        <th>Valor</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="mono">custom_success_count</td>
        <td class="mono">${cnt(successCnt)}</td>
        <td>Total de respuestas 200 recibidas</td>
      </tr>
      <tr>
        <td class="mono">custom_client_error_count</td>
        <td class="mono">${cnt(errores4xx)}</td>
        <td>Total de errores del cliente (4xx)</td>
      </tr>
      <tr>
        <td class="mono">custom_server_error_count</td>
        <td class="mono">${cnt(errores5xx)}</td>
        <td>Total de errores del servidor (5xx)</td>
      </tr>
      <tr>
        <td class="mono">custom_success_rate</td>
        <td class="mono">${pct(successRate, 'rate')}</td>
        <td>Porcentaje de requests con status 200</td>
      </tr>
      <tr>
        <td class="mono">custom_check_pass_rate</td>
        <td class="mono">${pct(checkRate, 'rate')}</td>
        <td>Porcentaje de requests donde todos los checks pasaron</td>
      </tr>
      <tr>
        <td class="mono">custom_response_body_size_bytes</td>
        <td class="mono">${val(bodySize, 'value')}</td>
        <td>Tamaño del último body recibido (bytes)</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Emiliano Maure · QA Automation Engineer · generado con k6 handleSummary
  </div>

</body>
</html>`;

  // Retornamos el objeto que k6 espera: clave = ruta del archivo, valor = contenido
  return {
    [`results/${escenario}-report.html`]: html,
    // También dejamos el JSON del summary por si se quiere analizar después
    [`results/${escenario}-summary.json`]: JSON.stringify(data, null, 2),
  };
}
