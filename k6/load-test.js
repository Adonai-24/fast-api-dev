import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate } from 'k6/metrics'

// Aqui se personalizan las metircas de k6
const healthDuration = new Trend('health_duration')
const itemsDuration = new Trend('items_duration')
const errorRate = new Rate('error_rate')

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp-up: 0 → 10 usuarios
    { duration: '1m', target: 10 }, // Sostenido: 10 usuarios por 1 minuto
    { duration: '20s', target: 0 } // Ramp-down: 10 → 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests < 500ms
    error_rate: ['rate<0.1'] // Menos del 10% de errores
  }
}

const BASE_URL = 'http://localhost:3000'

export default function () {
  const healthRes = http.get(`${BASE_URL}/health`)
  healthDuration.add(healthRes.timings.duration)

  const healthOk = check(healthRes, {
    'health: status 200': (r) => r.status === 200,
    'health: body tiene status': (r) => JSON.parse(r.body).status === 'OK'
  })
  errorRate.add(!healthOk)

  sleep(1)

  const itemsRes = http.get(`${BASE_URL}/items`)
  itemsDuration.add(itemsRes.timings.duration)

  const itemsOk = check(itemsRes, {
    'items: status 200': (r) => r.status === 200,
    'items: es un array': (r) => Array.isArray(JSON.parse(r.body)),
    'items: tiene elementos': (r) => JSON.parse(r.body).length > 0
  })
  errorRate.add(!itemsOk)

  sleep(1)
}
