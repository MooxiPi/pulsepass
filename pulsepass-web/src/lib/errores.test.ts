import { describe, expect, it } from 'vitest'
import { MENSAJES, mensajeDeError } from './errores'
import { ApiError, ESTADO_RED } from './http'

describe('lib/errores — mapeo HTTP → interfaz (QT-FE-005, §13)', () => {
  it.each([
    [400, MENSAJES.validacion],
    [401, MENSAJES.sesionExpirada],
    [403, MENSAJES.sinPermisos],
    [404, MENSAJES.noEncontrado],
    [500, MENSAJES.inesperado],
    [ESTADO_RED, MENSAJES.red],
  ])('status %i → mensaje de interfaz', (status, esperado) => {
    expect(mensajeDeError(new ApiError(status, 'detalle interno'))).toBe(esperado)
  })

  it('409 muestra el mensaje del backend (traducido si es conocido)', () => {
    expect(mensajeDeError(new ApiError(409, 'User does not meet minimum age.'))).toBe(
      'El usuario no cumple la edad mínima del evento.',
    )
    expect(mensajeDeError(new ApiError(409, 'Mensaje nuevo del backend'))).toBe(
      'Mensaje nuevo del backend',
    )
  })

  it('500 nunca expone el detalle interno', () => {
    expect(mensajeDeError(new ApiError(500, 'NullPointerException at ...'))).not.toContain('Null')
  })

  it('un error que no es ApiError produce un mensaje genérico', () => {
    expect(mensajeDeError(new Error('stack'))).toBe(MENSAJES.inesperado)
  })
})
