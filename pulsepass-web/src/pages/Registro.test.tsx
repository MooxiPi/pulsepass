import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { servidor, registrarPeticiones } from '../test/mocks/servidor'
import { renderConProveedores } from '../test/utils'

async function llenar(
  user: ReturnType<typeof renderConProveedores>['user'],
  password: string,
  email = 'nueva@pulsepass.test',
) {
  await user.type(await screen.findByLabelText('Nombre de usuario'), 'nueva')
  await user.type(screen.getByLabelText('Correo electrónico'), email)
  await user.type(screen.getByLabelText('Nombres'), 'Nueva')
  await user.type(screen.getByLabelText('Apellidos'), 'Persona')
  await user.type(screen.getByLabelText('Fecha de nacimiento'), '1998-04-12')
  await user.type(screen.getByLabelText('Contraseña (mín. 12)'), password)
}

describe('Registro', () => {
  it('TEST-FE-AUTH-004: contraseña de 11 caracteres → error y 0 peticiones', async () => {
    const { user } = renderConProveedores('/registro')
    const peticiones = registrarPeticiones()
    await llenar(user, '12345678901')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('La contraseña debe tener al menos 12 caracteres'),
    ).toBeInTheDocument()
    expect(peticiones).toHaveLength(0)
  })

  it('campos obligatorios y correo inválido muestran errores sin llamar a la API', async () => {
    const { user } = renderConProveedores('/registro')
    const peticiones = registrarPeticiones()
    await user.type(await screen.findByLabelText('Correo electrónico'), 'no-es-correo')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Ingresa un nombre de usuario')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true')
    expect(peticiones).toHaveLength(0)
  })

  it('TEST-FE-AUTH-005: registro 201 → redirección a /login con aviso', async () => {
    const { user, router } = renderConProveedores('/registro')
    const peticiones = registrarPeticiones()
    await llenar(user, 'una-clave-bien-larga')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(await screen.findByText('Cuenta creada, inicia sesión.')).toBeInTheDocument()
    // El rol nunca viaja desde la UI.
    expect(peticiones[0]?.cuerpo).not.toHaveProperty('roles')
  })

  it('TEST-FE-AUTH-006: registro 409 → mensaje genérico sin detalles internos', async () => {
    const { user } = renderConProveedores('/registro')
    await llenar(user, 'una-clave-bien-larga', 'andrea@pulsepass.test')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent('El usuario o correo ya está registrado.')
    expect(alerta).not.toHaveTextContent('andrea@pulsepass.test')
  })

  it('400 con details → errores en los campos (setError)', async () => {
    servidor.use(
      http.post('*/api/users', () =>
        HttpResponse.json(
          { status: 400, message: 'Validation failed', details: { email: 'Invalid email format' } },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderConProveedores('/registro')
    await llenar(user, 'una-clave-bien-larga')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument()
  })
})
