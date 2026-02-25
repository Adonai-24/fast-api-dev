const request = require('supertest')
const app = require('../app')
const { calculateValue } = require('../lib/logic')

describe('Suite de Pruebas de Calidad de Software', () => {
  describe('Pruebas Unitarias - Lógica de Inventario', () => {
    test('Debe calcular correctamente el valor total (10 * 5 = 50)', () => {
      const result = calculateValue(10, 5)
      expect(result).toBe(50)
    })

    test('Debe retornar 0 si se ingresan valores negativos', () => {
      const result = calculateValue(-10, 5)
      expect(result).toBe(0)
    })

    // Nuevos 2 tests enfocados a la lógica de negocio
    test('Debe retornar 0 cuando el stock es 0', () => {
      const result = calculateValue(10, 0)
      expect(result).toBe(0)
    })

    test('Debe retornar 0 cuando el precio es 0', () => {
      const result = calculateValue(0, 10)
      expect(result).toBe(0)
    })
  })

  describe('Pruebas de Integración - API Endpoints', () => {
    test('GET /health - Debe responder con status 200 y JSON correcto', async () => {
      const response = await request(app).get('/health')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('status', 'OK')
    })

    test('GET /items - Debe validar la estructura del inventario', async () => {
      const response = await request(app).get('/items')
      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      // Validamos que el primer objeto tenga las propiedades requeridas
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('stock')
    })

    // Nuevos 2 tests enfocados en nuevos escenarios de respuesta de la API
    test('Debe responder 404 para ruta inexistente', async () => {
      const response = await request(app).get('/ruta-que-no-existe')
      expect(response.statusCode).toBe(404)
    })

    test('GET /items - Cada item debe tener id, name y stock como número', async () => {
      const response = await request(app).get('/items')

      expect(response.statusCode).toBe(200)

      response.body.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('stock')
        expect(typeof item.stock).toBe('number')
      })
    })
  })
})
