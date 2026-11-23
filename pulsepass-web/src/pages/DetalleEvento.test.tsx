import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { registrarPeticiones } from '../test/mocks/servidor'
import { renderConProveedores } from '../test/utils'

async function abrirModalCompra(
  user: ReturnType<typeof renderConProveedores>['user'],
  tipo = 'VIP',
) {
  await user.click(await screen.findByRole('radio', { name: tipo }))
  const [boton] = screen.getAllByRole('button', { name: 'Comprar entrada' })
  await user.click(boton!)
  return screen.findByRole('dialog', { name: 'Confirmar compra' })
}

describe('Detalle de evento — /eventos/:eventCode', () => {
  it('TEST-FE-EVT-004: muestra evento, artistas y sede (AC-FE-002)', async () => {
    renderConProveedores('/eventos/CMF-2026')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByText('MUSIC')).toBeInTheDocument()
    expect(screen.getByText('Edad mínima: 18')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Solar Beat/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Neon Waves/ })).toBeInTheDocument()
    expect(await screen.findByText('Santa Marta · Capacidad 3')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Marina Convention Center/ })).toHaveAttribute(
      'href',
      '/sedes/VEN-SMR-01',
    )
  })

  it('TEST-FE-EVT-005: 404 → "Evento no disponible" sin datos del borrador (AC-FE-003)', async () => {
    renderConProveedores('/eventos/DRAFT-2027')
    expect(await screen.findByText('Evento no disponible')).toBeInTheDocument()
    expect(screen.queryByText('Festival Borrador')).not.toBeInTheDocument()
  })

  it('TEST-FE-EVT-006: evento SOLD_OUT → compra deshabilitada con motivo', async () => {
    renderConProveedores('/eventos/TEC-2027', { usuario: 'andrea' })
    expect(await screen.findByText('Entradas agotadas.')).toBeInTheDocument()
    for (const boton of screen.getAllByRole('button', { name: 'Comprar entrada' })) {
      expect(boton).toBeDisabled()
    }
  })

  it('TEST-FE-TKT-002: compra anónima → login y regreso al evento (AC-FE-004)', async () => {
    const { user, router } = renderConProveedores('/eventos/CMF-2026')
    const [enlace] = await screen.findAllByRole('link', { name: 'Inicia sesión para comprar' })
    await user.click(enlace!)
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await user.type(screen.getByLabelText('Contraseña'), 'clave-segura-andrea')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/eventos/CMF-2026'))
  })

  it('TEST-FE-TKT-001 y TEST-FE-TKT-004: compra válida envía el email de la sesión y navega a la confirmación', async () => {
    const { user, router } = renderConProveedores('/eventos/CMF-2026', { usuario: 'andrea' })
    const peticiones = registrarPeticiones()
    const dialogo = await abrirModalCompra(user, 'VIP')
    expect(within(dialogo).getByText('andrea@pulsepass.test')).toBeInTheDocument()

    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toMatch(/^\/compra\/confirmacion\/TCK-NUEVO/),
    )
    expect(await screen.findByText('¡Compra realizada con éxito!')).toBeInTheDocument()
    const compra = peticiones.find((p) => p.metodo === 'POST' && p.ruta === '/api/tickets')
    await waitFor(() =>
      expect(compra?.cuerpo).toEqual({
        userEmail: 'andrea@pulsepass.test',
        eventCode: 'CMF-2026',
        type: 'VIP',
      }),
    )
  })

  it('TEST-FE-TKT-003: compra 409 → mensaje del backend en el modal, sin navegar (AC-FE-009)', async () => {
    const { user, router } = renderConProveedores('/eventos/CMF-2026', { usuario: 'laura' })
    const dialogo = await abrirModalCompra(user)
    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'El usuario no cumple la edad mínima del evento.',
    )
    expect(router.state.location.pathname).toBe('/eventos/CMF-2026')
    expect(screen.getByRole('dialog', { name: 'Confirmar compra' })).toBeInTheDocument()
  })

  it('STAFF/ADMIN no ven el panel de compra', async () => {
    renderConProveedores('/eventos/CMF-2026', { usuario: 'staff' })
    await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })
    expect(screen.queryByRole('heading', { name: 'Entradas' })).not.toBeInTheDocument()
  })

  it('no existe campo editable para el email del comprador (§24.3)', async () => {
    renderConProveedores('/eventos/CMF-2026', { usuario: 'andrea' })
    await screen.findByRole('heading', { name: 'Entradas' })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
