# Testing de performance con k6

![k6](https://img.shields.io/badge/k6-performance%20testing-7D64FF?logo=k6&logoColor=white)
![Estado](https://img.shields.io/badge/estado-activo-brightgreen)
![Escenarios](https://img.shields.io/badge/escenarios-5-blue)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

Demo de pruebas de performance construida con [k6](https://k6.io/) como parte de mi portafolio de QA Automation.

---

## Por qué importa el testing de performance

La mayoría de los bugs funcionales se encuentran con tests unitarios o de integración.  
Pero hay un tipo de problema que no aparece en esos tests: **el sistema funciona bien con un usuario, y falla con cien**.

Lentitud bajo carga, caídas inesperadas, degradación con el tiempo — estos son problemas que solo se detectan simulando tráfico real. Eso es exactamente lo que hace este proyecto.

Implementar performance testing dentro de un flujo de QA permite:
- Detectar cuellos de botella antes de que lleguen a producción
- Definir criterios de aceptación de rendimiento (SLOs) medibles y automatizables
- Dar al equipo datos concretos, no suposiciones, sobre el comportamiento del sistema bajo carga

---

## Qué incluye este proyecto

### 5 escenarios de prueba

| Escenario | Usuarios | Duración | Qué detecta |
|-----------|----------|----------|-------------|
| Smoke     | 1        | ~10 seg  | Si la API está viva y responde correctamente |
| Load      | 20       | ~2 min   | Comportamiento bajo tráfico normal esperado |
| Stress    | 200      | ~3.5 min | Punto de quiebre más allá de la capacidad normal |
| Spike     | 200      | ~2 min   | Resistencia ante picos repentinos y velocidad de recuperación |
| Soak      | 20       | ~10 min  | Degradación con el tiempo: memory leaks, conexiones no liberadas |

### Métricas personalizadas (`utils/metrics.js`)

Las métricas están centralizadas en un módulo compartido e importado por todos los tests.  
Esto demuestra aplicación del principio DRY y facilita el mantenimiento.

| Métrica | Tipo | Qué mide |
|---------|------|----------|
| `custom_success_count` | Counter | Total de respuestas HTTP 200 |
| `custom_client_error_count` | Counter | Total de errores 4xx |
| `custom_server_error_count` | Counter | Total de errores 5xx |
| `custom_response_body_size_bytes` | Gauge | Tamaño del body de la última respuesta |
| `custom_check_pass_rate` | Rate | % de requests donde todos los checks pasaron |
| `custom_success_rate` | Rate | % de respuestas con status 200 |
| `custom_request_duration_ms` | Trend | Duración total del request (p50 / p95 / p99) |
| `custom_time_to_first_byte_ms` | Trend | Tiempo hasta el primer byte (TTFB) |
| `custom_connection_time_ms` | Trend | Tiempo de establecimiento de conexión TCP |

### Reportes HTML automáticos (`utils/report.js`)

Al terminar cada test, k6 genera automáticamente un reporte HTML en `results/`.  
No requiere herramientas externas: usa la función nativa `handleSummary` de k6.

```
results/
├── smoke-report.html
├── load-report.html
├── stress-report.html
├── spike-report.html
└── soak-report.html
```

Cada reporte incluye resumen general, tabla de tiempos con percentiles (p50/p90/p95/p99) y detalle de todas las métricas personalizadas.

---

## Integración con CI/CD (GitHub Actions)

El proyecto incluye un workflow que integra los tests en el ciclo de desarrollo.

| Evento | Qué corre |
|--------|-----------|
| Push a `main` o `develop` | Smoke test automático |
| Pull Request a `main` | Smoke + Load test (valida antes de mergear) |
| Ejecución manual | Cualquier escenario a elección, incluyendo "todos" |

Los tests más pesados (stress, spike, soak) son manuales a propósito: no tiene sentido correrlos en cada commit, pero sí antes de un release importante o cuando se detecta un problema de rendimiento.

Cada ejecución sube los resultados como artefacto descargable desde GitHub, disponibles por 7 días.

---

## Estructura del proyecto

```
performaceTesting-k6/
├── .github/
│   └── workflows/
│       └── performance-tests.yml
├── tests/
│   ├── smoke.js
│   ├── load.js
│   ├── stress.js
│   ├── spike.js
│   └── soak.js
├── utils/
│   ├── metrics.js
│   └── report.js
└── results/          ← reportes generados localmente (no se suben a Git)
```

---

## Cómo ejecutar las pruebas localmente

Instalar k6: https://k6.io/docs/get-started/installation/

```bash
k6 run tests/smoke.js
k6 run tests/load.js
k6 run tests/stress.js
k6 run tests/spike.js
k6 run tests/soak.js
```

Al terminar cada test, encontrás el reporte en `results/[escenario]-report.html`.  
Abrilo directo en el browser para ver los resultados formateados.

---

## Ejemplo de output en terminal

```
✓ status 200
✓ responde en menos de 800ms
✓ body no está vacío
✓ TTFB menor a 600ms

custom_check_pass_rate......: 100.00% ✓ 120  ✗ 0
custom_request_duration_ms..: avg=213ms  min=98ms  p(95)=410ms  p(99)=588ms
custom_success_count........: 120
custom_success_rate.........: 100.00% ✓ 120  ✗ 0
custom_time_to_first_byte_ms: avg=178ms  p(95)=340ms

http_req_duration............: avg=213ms  p(95)=410ms
http_req_failed..............: 0.00%
```

---

## API utilizada

```
https://api.escuelajs.co/api/v1/products
```

API pública de práctica. No requiere autenticación ni configuración previa.

---

## Autor

**Emiliano Maure** — QA Automation Engineer
