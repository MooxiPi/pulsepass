import { http as mswHttp, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { servidor, registrarPeticiones } from '../test/mocks/servidor'
import { ApiError, ESTADO_RED, configurarHttp, peticion } from './http'

const Esquema = z.object({ ok: z.boolean() })

afterEach(() => configurarHttp({ obtenerToken: () => null, alNoAutorizado: () => {} }))

describe('lib/http', () => {
  it('TEST-FE-LIB-001: añade Authorization Bearer cuando hay sesión (y nunca en la URL)', async () => {
    servidor.use(mswHttp.get('*/api/prueba', () => HttpResponse.json({ ok: true })))
    configurarHttp({ obtenerToken: () => 'abc.def.ghi', alNoAutorizado: () => {} })
    const peticiones = registrarPeticiones()

    await peticion('/prueba', Esquema)

    expect(peticiones[0]?.authorization).toBe('Bearer abc.def.ghi')
    expect(peticiones[0]?.url).not.toContain('abc.def.ghi')
  })

  it('sin sesión no envía Authorization', async () => {
    servidor.use(mswHttp.get('*/api/prueba', () => HttpResponse.json({ ok: true })))
    const peticiones = registrarPeticiones()
    await peticion('/prueba', Esquema)
    expect(peticiones[0]?.authorization).toBeNull()
  })

  it('TEST-FE-LIB-002: ErrorResponse válido → ApiError con status y details', async () => {
    servidor.use(
      mswHttp.post('*/api/prueba', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-08T10:00:00',
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: { name: 'Event name is required' },
          },
          { status: 400 },
        ),
      ),
    )
    const error = await peticion('/prueba', Esquema, { metodo: 'POST', cuerpo: {} }).catch(
      (e: unknown) => e,
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      message: 'Validation failed',
      details: { name: 'Event name is required' },
    })
  })

  it('TEST-FE-LIB-003: cuerpo de error inválido → ApiError genérico', async () => {
    servidor.use(
      mswHttp.get('*/api/prueba', () => new HttpResponse('<html>boom</html>', { status: 502 })),
    )
    const error = await peticion('/prueba', Esquema).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 502, details: {} })
    expect((error as ApiError).message).toMatch(/error inesperado/i)
  })

  it('TEST-FE-LIB-004: 401 en una petición autenticada dispara el cierre de sesión', async () => {
    servidor.use(
      mswHttp.get('*/api/prueba', () =>
        HttpResponse.json({ status: 401, message: 'Authentication required' }, { status: 401 }),
      ),
    )
    const alNoAutorizado = vi.fn()
    configurarHttp({ obtenerToken: () => 'vencido', alNoAutorizado })

    await expect(peticion('/prueba', Esquema)).rejects.toMatchObject({ status: 401 })
    expect(alNoAutorizado).toHaveBeenCalledTimes(1)
  })

  it('un 401 sin token (p. ej. login) no cierra la sesión', async () => {
    servidor.use(
      mswHttp.post('*/api/prueba', () =>
        HttpResponse.json({ status: 401, message: 'Bad credentials' }, { status: 401 }),
      ),
    )
    const alNoAutorizado = vi.fn()
    configurarHttp({ obtenerToken: () => null, alNoAutorizado })
    await expect(
      peticion('/prueba', Esquema, { metodo: 'POST', cuerpo: {} }),
    ).rejects.toMatchObject({
      status: 401,
    })
    expect(alNoAutorizado).not.toHaveBeenCalled()
  })

  it('fallo de red → ApiError con estado de red', async () => {
    servidor.use(mswHttp.get('*/api/prueba', () => HttpResponse.error()))
    await expect(peticion('/prueba', Esquema)).rejects.toMatchObject({
      status: ESTADO_RED,
      message: 'No pudimos conectar con el servidor.',
    })
  })

  it('valida con zod la respuesta exitosa', async () => {
    servidor.use(mswHttp.get('*/api/prueba', () => HttpResponse.json({ inesperado: 1 })))
    await expect(peticion('/prueba', Esquema)).rejects.toBeInstanceOf(ApiError)
  })
})
