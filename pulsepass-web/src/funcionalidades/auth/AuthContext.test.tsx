import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { registrarPeticiones, servidor } from '../../test/mocks/servidor'
import { renderConProveedores } from '../../test/utils'

describe('Sesión (AuthContext)', () => {
  it('restaura la sesión al recargar si el token no expiró (FR-FE-AUTH-004)', async () => {
    renderConProveedores('/cuenta', { usuario: 'andrea' })
    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument()
    expect(await screen.findByText('Andrea Ruiz')).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-011: token expirado al restaurar sesión → anónimo, sin llamar a la API', async () => {
    const peticiones = registrarPeticiones()
    const { router } = renderConProveedores('/cuenta', {
      usuario: 'andrea',
      expiraEn: Date.now() - 1000,
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(window.sessionStorage.getItem('pulsepass.sesion')).toBeNull()
    expect(peticiones.filter((p) => p.ruta === '/api/auth/me')).toHaveLength(0)
  })

  it('TEST-FE-AUTH-010: cerrar sesión limpia token y caché', async () => {
    const { user, queryClient, router } = renderConProveedores('/cuenta', { usuario: 'andrea' })
    await screen.findByText('Andrea Ruiz')
    expect(queryClient.getQueryCache().getAll().length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(window.sessionStorage.getItem('pulsepass.sesion')).toBeNull()
    // Tras salir, las rutas protegidas redirigen a /login (FR-FE-AUTH-006).
    await router.navigate('/mis-tickets')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(
      queryClient.getQueryCache().find({ queryKey: ['usuario', 'andrea@pulsepass.test'] }),
    ).toBeUndefined()
  })

  it('AC-FE-018: un 401 en cualquier petición cierra la sesión, limpia la caché y va a /login', async () => {
    servidor.use(
      http.get('*/api/tickets/by-user', () =>
        HttpResponse.json({ status: 401, message: 'Authentication required' }, { status: 401 }),
      ),
    )
    const { router, queryClient } = renderConProveedores('/mis-tickets', { usuario: 'andrea' })

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
    expect(window.sessionStorage.getItem('pulsepass.sesion')).toBeNull()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it('QT-FE-007: el token viaja solo en Authorization, nunca en la URL', async () => {
    const peticiones = registrarPeticiones()
    renderConProveedores('/mis-tickets', { usuario: 'andrea' })
    await screen.findByRole('heading', { name: 'Mis tickets' })
    await screen.findByText('Caribbean Music Fest 2026')

    const autenticadas = peticiones.filter((p) => p.authorization)
    expect(autenticadas.length).toBeGreaterThan(0)
    for (const peticion of peticiones) {
      expect(peticion.url).not.toContain('token-andrea')
      if (peticion.authorization) expect(peticion.authorization).toBe('Bearer token-andrea')
    }
  })

  it('la navbar muestra el usuario de /api/auth/me', async () => {
    renderConProveedores('/', { usuario: 'andrea' })
    const cabecera = await screen.findByRole('banner')
    expect(await within(cabecera).findByText('andrea')).toBeInTheDocument()
  })
})
