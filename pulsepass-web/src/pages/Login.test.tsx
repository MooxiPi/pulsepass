import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { registrarPeticiones } from '../test/mocks/servidor'
import { renderConProveedores } from '../test/utils'

describe('Login', () => {
  it('TEST-FE-AUTH-001: login válido → sesión autenticada y redirección a "desde"', async () => {
    const { user, router } = renderConProveedores({
      pathname: '/login',
      state: { desde: '/mis-tickets' },
    })

    await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await user.type(screen.getByLabelText('Contraseña'), 'clave-segura-andrea')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/mis-tickets'))
    expect(await screen.findByRole('heading', { name: 'Mis tickets' })).toBeInTheDocument()
    // AC-FE-007: el token vive en sessionStorage (no en localStorage) y el nombre va en la navbar.
    expect(window.sessionStorage.getItem('pulsepass.sesion')).toContain('token-andrea')
    expect(window.localStorage.length).toBe(0)
    expect(screen.getAllByText('andrea').length).toBeGreaterThan(0)
  })

  it('TEST-FE-AUTH-002: login 401 → "Credenciales inválidas"', async () => {
    const { user } = renderConProveedores('/login')
    await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await user.type(screen.getByLabelText('Contraseña'), 'equivocada')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas.')
    expect(window.sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('TEST-FE-AUTH-003: login sin campos → errores y 0 peticiones', async () => {
    const { user } = renderConProveedores('/login')
    const peticiones = registrarPeticiones()
    await user.click(await screen.findByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Ingresa tu usuario o correo')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
    expect(peticiones).toHaveLength(0)
  })

  it('muestra "Tu sesión expiró" cuando llega con motivo expirada', async () => {
    renderConProveedores({ pathname: '/login', state: { motivo: 'expirada' } })
    expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
  })

  it('con sesión activa, /login redirige a inicio (SoloAnonimo)', async () => {
    const { router } = renderConProveedores('/login', { usuario: 'andrea' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
