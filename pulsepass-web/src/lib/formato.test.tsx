import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PrecioCOP from '../componentes/PrecioCOP'
import { aFecha, formatearFecha, formatearPrecio, iniciales } from './formato'

describe('lib/formato', () => {
  it('TEST-FE-LIB-005: PrecioCOP formatea 250000 como COP', () => {
    render(<PrecioCOP valor={250000} />)
    // es-CO: "$ 250.000" (con espacio no separable), sin decimales.
    expect(screen.getByText(/^\$\s?250\.000$/u)).toBeInTheDocument()
    expect(formatearPrecio(120000)).toMatch(/^\$\s?120\.000$/u)
  })

  it('formatea fechas LocalDateTime de la API en es-CO', () => {
    expect(formatearFecha('2026-12-12T20:00:00')).toMatch(/^12 dic 2026$/)
  })

  it('acepta LocalDateTime con microsegundos (como los devuelve el backend real)', () => {
    expect(aFecha('2027-11-08T14:47:38.913845').getTime()).toBe(
      new Date(2027, 10, 8, 14, 47, 38, 913).getTime(),
    )
  })

  it('obtiene iniciales para avatares', () => {
    expect(iniciales('Solar Beat')).toBe('SB')
    expect(iniciales('andrea')).toBe('A')
  })
})
