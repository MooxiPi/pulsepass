import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { registrarPeticiones, servidor } from '../test/mocks/servidor'
import { renderConProveedores } from '../test/utils'

describe('Artistas', () => {
  it('TEST-FE-ART-001: lista de artistas activos', async () => {
    renderConProveedores('/artistas')
    expect(await screen.findByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()
    expect(screen.getByText('Caribbean Sound')).toBeInTheDocument()
  })

  it('TEST-FE-ART-002: detalle de artista con eventos', async () => {
    renderConProveedores('/artistas/1')
    expect(await screen.findByRole('heading', { level: 1, name: 'Solar Beat' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Próximos eventos de Solar Beat' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
  })

  it('detalle de artista sin eventos → "Sin eventos próximos"', async () => {
    renderConProveedores('/artistas/3')
    expect(await screen.findByText('Sin eventos próximos')).toBeInTheDocument()
  })

  it('TEST-FE-ART-003: id no numérico → 404 sin llamar a la API', async () => {
    const peticiones = registrarPeticiones()
    renderConProveedores('/artistas/abc')
    expect(await screen.findByText('No encontramos esta página')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.ruta.startsWith('/api/artists'))).toHaveLength(0)
  })

  it('artista inexistente (404 de la API) → no encontrada', async () => {
    renderConProveedores('/artistas/999')
    expect(await screen.findByText('No encontramos esta página')).toBeInTheDocument()
  })
})

describe('Sedes', () => {
  it('TEST-FE-VEN-001: lista y detalle de sede; 404 de sede', async () => {
    const lista = renderConProveedores('/sedes')
    expect(await screen.findByText('Marina Convention Center')).toBeInTheDocument()
    expect(screen.getByText(/Santa Marta · Cap\. 3/)).toBeInTheDocument()
    lista.unmount()

    const detalle = renderConProveedores('/sedes/VEN-SMR-01')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Marina Convention Center' }),
    ).toBeInTheDocument()
    expect(screen.getByText('3 personas')).toBeInTheDocument()
    expect(screen.getByText('VEN-SMR-01')).toBeInTheDocument()
    detalle.unmount()

    renderConProveedores('/sedes/NO-EXISTE')
    expect(await screen.findByText('No encontramos esta página')).toBeInTheDocument()
  })

  it('lista vacía de sedes → estado vacío', async () => {
    servidor.use(http.get('*/api/venues/active', () => HttpResponse.json([])))
    renderConProveedores('/sedes')
    expect(await screen.findByText('Aún no hay sedes activas')).toBeInTheDocument()
  })
})
