import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { error } from '../test/mocks/handlers'
import { servidor } from '../test/mocks/servidor'
import { renderConProveedores } from '../test/utils'

const tarjetaDe = (codigo: string) => screen.getByText(codigo).closest('li') as HTMLElement

describe('Mis tickets — /mis-tickets', () => {
  it('TEST-FE-TKT-005: lista y filtra por estado', async () => {
    const { user } = renderConProveedores('/mis-tickets', { usuario: 'andrea' })
    expect(await screen.findByText('TCK-8F2A1C')).toBeInTheDocument()
    expect(screen.getByText('TCK-USADO01')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Usados' }))
    expect(screen.getByRole('button', { name: 'Usados' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('TCK-8F2A1C')).not.toBeInTheDocument()
    expect(screen.getByText('TCK-USADO01')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancelados' }))
    expect(screen.getByText('No hay tickets con este estado')).toBeInTheDocument()
  })

  it('TEST-FE-TKT-006: vacío → mensaje y enlace a la cartelera', async () => {
    servidor.use(http.get('*/api/tickets/by-user', () => HttpResponse.json([])))
    renderConProveedores('/mis-tickets', { usuario: 'andrea' })
    expect(await screen.findByText('Aún no tienes tickets')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/eventos')
  })

  it('TEST-FE-TKT-007: cancelar PAID → 200 y lista actualizada (AC-FE-010)', async () => {
    const { user } = renderConProveedores('/mis-tickets', { usuario: 'andrea' })
    await screen.findByText('TCK-8F2A1C')
    await user.click(within(tarjetaDe('TCK-8F2A1C')).getByRole('button', { name: 'Cancelar' }))

    const dialogo = await screen.findByRole('dialog', { name: 'Cancelar ticket' })
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar ticket' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() =>
      expect(within(tarjetaDe('TCK-8F2A1C')).getByText('CANCELLED')).toBeInTheDocument(),
    )
    expect(screen.getByText('Ticket cancelado.')).toBeInTheDocument()
  })

  it('TEST-FE-TKT-008: cancelar → 409 muestra el mensaje y mantiene el modal', async () => {
    servidor.use(
      http.patch('*/api/tickets/:codigo/cancel', () =>
        error(409, 'Ticket cannot be cancelled after the event date.'),
      ),
    )
    const { user } = renderConProveedores('/mis-tickets', { usuario: 'andrea' })
    await screen.findByText('TCK-8F2A1C')
    await user.click(within(tarjetaDe('TCK-8F2A1C')).getByRole('button', { name: 'Cancelar' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Cancelar ticket' })
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar ticket' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'El ticket no se puede cancelar después de la fecha del evento.',
    )
    expect(screen.getByRole('dialog', { name: 'Cancelar ticket' })).toBeInTheDocument()
  })

  it('TEST-FE-TKT-010: botón cancelar oculto si status ≠ PAID (AC-FE-011)', async () => {
    renderConProveedores('/mis-tickets', { usuario: 'andrea' })
    await screen.findByText('TCK-USADO01')
    expect(within(tarjetaDe('TCK-USADO01')).queryByRole('button', { name: 'Cancelar' })).toBeNull()
    expect(within(tarjetaDe('TCK-8F2A1C')).getByRole('button', { name: 'Cancelar' })).toBeVisible()
  })

  it('el modal se cierra con Escape', async () => {
    const { user } = renderConProveedores('/mis-tickets', { usuario: 'andrea' })
    await screen.findByText('TCK-8F2A1C')
    await user.click(within(tarjetaDe('TCK-8F2A1C')).getByRole('button', { name: 'Cancelar' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Detalle de ticket — /mis-tickets/:ticketCode', () => {
  it('muestra código, tipo, precio y estado', async () => {
    renderConProveedores('/mis-tickets/TCK-8F2A1C', { usuario: 'andrea' })
    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByText('TCK-8F2A1C')).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText(/250\.000/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar ticket' })).toBeInTheDocument()
  })

  it('TEST-FE-TKT-009: ticket ajeno 403 → "Ticket no disponible" sin datos (AC-FE-014)', async () => {
    renderConProveedores('/mis-tickets/TCK-91B07D', { usuario: 'andrea' })
    expect(await screen.findByText('Ticket no disponible')).toBeInTheDocument()
    expect(screen.queryByText('carlos@pulsepass.test')).not.toBeInTheDocument()
  })

  it('ticket inexistente 404 → misma pantalla', async () => {
    servidor.use(http.get('*/api/tickets/:codigo', () => error(404, 'Ticket not found')))
    renderConProveedores('/mis-tickets/TCK-NOEXISTE', { usuario: 'andrea' })
    expect(await screen.findByText('Ticket no disponible')).toBeInTheDocument()
  })
})
