import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { reiniciarDb } from './mocks/datos'
import { servidor } from './mocks/servidor'

// Sin red real: cualquier petición no simulada hace fallar la prueba (QT-FE-009).
beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  servidor.resetHandlers()
  servidor.events.removeAllListeners()
  reiniciarDb()
  window.sessionStorage.clear()
  window.localStorage.clear()
})

afterAll(() => servidor.close())
