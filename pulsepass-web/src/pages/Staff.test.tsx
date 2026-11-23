import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderConProveedores } from '../test/utils'

async function buscar(user: ReturnType<typeof renderConProveedores>['user'], codigo: string) {
  const campo = await screen.findByLabelText('Código de ticket')
  await user.clear(campo)
  await user.type(campo, `${codigo}{Enter}`)
}

describe('Validación de ingreso — /staff/validacion', () => {
  it('TEST-FE-STF-001: buscar y marcar como usado → éxito', async () => {
    const { user } = renderConProveedores('/staff/validacion', { usuario: 'staff' })
    expect(await screen.findByLabelText('Código de ticket')).toHaveFocus()
    await buscar(user, 'TCK-91B07D')

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Marcar como usado' }))

    expect(await screen.findByText('Ingreso registrado.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('USED')).toBeInTheDocument())
    // Tras el éxito el campo se limpia.
    expect(screen.getByLabelText('Código de ticket')).toHaveValue('')
  })

  it('TEST-FE-STF-002: segunda vez → 409 visible (AC-FE-016)', async () => {
    const { user } = renderConProveedores('/staff/validacion', { usuario: 'staff' })
    await buscar(user, 'TCK-91B07D')
    await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
    await screen.findByText('Ingreso registrado.')

    await user.click(screen.getByRole('button', { name: 'Marcar como usado' }))
    expect(
      await screen.findByText('El ticket ya fue utilizado o no está pagado.'),
    ).toBeInTheDocument()
  })

  it('TEST-FE-STF-003: ticket inexistente → 404 visible', async () => {
    const { user } = renderConProveedores('/staff/validacion', { usuario: 'staff' })
    await buscar(user, 'TCK-NOEXISTE')
    expect(await screen.findByText('Ticket no encontrado.')).toBeInTheDocument()
  })

  it('código vacío → error de validación', async () => {
    const { user } = renderConProveedores('/staff/validacion', { usuario: 'staff' })
    await user.click(await screen.findByRole('button', { name: 'Buscar' }))
    expect(await screen.findByText('Ingresa un código')).toBeInTheDocument()
  })
})

describe('Tickets pagados — /staff/eventos/:eventCode/tickets', () => {
  it('TEST-FE-STF-004: tabla con filas', async () => {
    renderConProveedores('/staff/eventos/CMF-2026/tickets', { usuario: 'staff' })
    const tabla = await screen.findByRole('table', { name: 'Tickets pagados de CMF-2026' })
    expect(within(tabla).getByText('TCK-8F2A1C')).toBeInTheDocument()
    expect(within(tabla).getByText('TCK-91B07D')).toBeInTheDocument()
    expect(screen.getByText('Total: 2')).toBeInTheDocument()
  })

  it('"Usar" marca el ticket y lo quita de la lista de pagados', async () => {
    const { user } = renderConProveedores('/staff/eventos/CMF-2026/tickets', { usuario: 'admin' })
    const tabla = await screen.findByRole('table')
    const fila = within(tabla).getByText('TCK-91B07D').closest('tr') as HTMLElement
    await user.click(within(fila).getByRole('button', { name: 'Usar' }))
    await waitFor(() => expect(screen.queryByText('TCK-91B07D')).not.toBeInTheDocument())
    expect(screen.getByText('Total: 1')).toBeInTheDocument()
  })

  it('evento inexistente → 404 de evento', async () => {
    renderConProveedores('/staff/eventos/NO-EXISTE/tickets', { usuario: 'staff' })
    expect(await screen.findByText('Evento no encontrado')).toBeInTheDocument()
  })

  it('evento sin tickets pagados → estado vacío', async () => {
    renderConProveedores('/staff/eventos/JAZZ-2026/tickets', { usuario: 'staff' })
    expect(await screen.findByText('No hay tickets pagados')).toBeInTheDocument()
  })
})
