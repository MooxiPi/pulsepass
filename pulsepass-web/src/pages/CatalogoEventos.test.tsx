import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { servidor } from '../test/mocks/servidor'
import { renderConProveedores } from '../test/utils'

describe('Cartelera — /eventos', () => {
  it('TEST-FE-EVT-001: lista eventos publicados sin pedir login (AC-FE-001)', async () => {
    renderConProveedores('/eventos')
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('Noche de Jazz y Cultura')).toBeInTheDocument()
    // El borrador nunca aparece en la cartelera.
    expect(screen.queryByText('Festival Borrador')).not.toBeInTheDocument()
    // La tarjeta completa es un enlace al detalle.
    expect(screen.getByRole('link', { name: /Caribbean Music Fest 2026/ })).toHaveAttribute(
      'href',
      '/eventos/CMF-2026',
    )
  })

  it('TEST-FE-EVT-002: lista vacía → estado vacío', async () => {
    servidor.use(http.get('*/api/events/published', () => HttpResponse.json([])))
    renderConProveedores('/eventos')
    expect(await screen.findByText('Aún no hay eventos publicados')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-003: filtro por texto y categoría actualiza la URL', async () => {
    const { user, router } = renderConProveedores('/eventos')
    await screen.findByText('Caribbean Music Fest 2026')

    await user.type(screen.getByLabelText('Buscar por nombre'), 'jazz')
    await waitFor(() => expect(router.state.location.search).toContain('q=jazz'))
    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Noche de Jazz y Cultura')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Buscar por nombre'))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
    await waitFor(() => expect(router.state.location.search).toBe('?categoria=MUSIC'))
    expect(screen.getByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.queryByText('Noche de Jazz y Cultura')).not.toBeInTheDocument()
  })

  it('el filtro persiste en la URL al recargar (?q=&categoria=)', async () => {
    renderConProveedores('/eventos?q=sin-coincidencias')
    expect(await screen.findByText('Sin resultados para tu búsqueda')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar por nombre')).toHaveValue('sin-coincidencias')
  })

  it('?artista= usa GET /api/events/by-artist', async () => {
    renderConProveedores('/eventos?artista=Neon%20Waves')
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.queryByText('Noche de Jazz y Cultura')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Artista')).toHaveValue('Neon Waves')
    expect(within(screen.getByRole('main')).getByText('1 evento')).toBeInTheDocument()
  })

  it('error de carga → mensaje + reintentar', async () => {
    servidor.use(http.get('*/api/events/published', () => HttpResponse.error()))
    renderConProveedores('/eventos')
    expect(await screen.findByText('No pudimos conectar con el servidor.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})
