import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import ErrorPagina from './pages/ErrorPagina'
import { renderConProveedores } from './test/utils'

describe('Rutas transversales', () => {
  it('TEST-FE-GEN-001: ruta inexistente → 404', async () => {
    renderConProveedores('/no-existe/en-absoluto')
    expect(await screen.findByText('No encontramos esta página')).toBeInTheDocument()
  })

  it('TEST-FE-GEN-002: errorElement muestra un mensaje seguro (sin stack)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Explota(): never {
      throw new Error('TypeError: x is undefined at secreto.ts:42')
    }
    const router = createMemoryRouter([
      { path: '/', Component: Explota, errorElement: <ErrorPagina /> },
    ])
    render(<RouterProvider router={router} />)

    expect(await screen.findByText('¡Ups! Algo salió mal.')).toBeInTheDocument()
    expect(screen.queryByText(/secreto\.ts/)).not.toBeInTheDocument()
    expect(screen.queryByText(/TypeError/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('la página de inicio muestra el hero y los eventos publicados', async () => {
    renderConProveedores('/')
    expect(
      screen.getByRole('heading', { name: 'Descubre los mejores eventos' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeInTheDocument()
  })
})
