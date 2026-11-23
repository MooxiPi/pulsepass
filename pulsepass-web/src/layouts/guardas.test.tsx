import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderConProveedores } from '../test/utils'

describe('Guardas de ruta (QT-FE-004)', () => {
  it('TEST-FE-AUTH-007: RutaProtegida — anónimo → /login con state.desde', async () => {
    const { router } = renderConProveedores('/mis-tickets')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toEqual({ desde: '/mis-tickets' })
  })

  it('TEST-FE-AUTH-008: RutaPorRol — USER en /admin → /403', async () => {
    const { router } = renderConProveedores('/admin/eventos', { usuario: 'andrea' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
    expect(
      await screen.findByText('No tienes permisos para acceder a esta sección.'),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-009: RutaPorRol — ADMIN en /admin → renderiza', async () => {
    renderConProveedores('/admin/eventos', { usuario: 'admin' })
    expect(
      await screen.findByRole('heading', { name: 'Administración de eventos' }),
    ).toBeInTheDocument()
  })

  it('STAFF puede abrir la validación de ingreso pero no la administración', async () => {
    const staff = renderConProveedores('/staff/validacion', { usuario: 'staff' })
    expect(
      await screen.findByRole('heading', { name: 'Validación de ingreso' }),
    ).toBeInTheDocument()
    staff.unmount()

    const otro = renderConProveedores('/admin/eventos', { usuario: 'staff' })
    await waitFor(() => expect(otro.router.state.location.pathname).toBe('/403'))
  })

  it('USER no accede a la validación de STAFF', async () => {
    const { router } = renderConProveedores('/staff/validacion', { usuario: 'andrea' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })

  it('STAFF no ve "Mis tickets" (ruta solo USER)', async () => {
    const { router } = renderConProveedores('/mis-tickets', { usuario: 'staff' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })
})
