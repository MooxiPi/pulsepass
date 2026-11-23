import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { registrarPeticiones, servidor } from '../test/mocks/servidor'
import { renderConProveedores } from '../test/utils'

type Usuario = ReturnType<typeof renderConProveedores>['user']

async function llenarFormulario(user: Usuario) {
  await user.type(await screen.findByLabelText('Código del evento'), 'NEW-2027')
  await user.type(screen.getByLabelText('Nombre'), 'Festival Nuevo 2027')
  await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
  await user.clear(screen.getByLabelText('Edad mínima'))
  await user.type(screen.getByLabelText('Edad mínima'), '18')
  await user.type(screen.getByLabelText('Fecha y hora'), '2027-03-01T20:00')
  await waitFor(() => expect(screen.getByLabelText('Sede')).toBeEnabled())
  await user.selectOptions(screen.getByLabelText('Sede'), 'VEN-SMR-01')
}

describe('Crear evento — /admin/eventos/nuevo', () => {
  it('TEST-FE-ADM-001: campos vacíos → errores y 0 peticiones (AC-FE-017)', async () => {
    const { user } = renderConProveedores('/admin/eventos/nuevo', { usuario: 'admin' })
    await screen.findByRole('heading', { name: 'Nuevo evento' })
    const peticiones = registrarPeticiones()
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findByText('Ingresa el código del evento')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el nombre del evento')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument()
    expect(screen.getByText('Selecciona la fecha y hora')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una sede')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.metodo === 'POST')).toHaveLength(0)
  })

  it('TEST-FE-ADM-002: 201 → navega a la gestión y recuerda el evento en la sesión', async () => {
    const { user, router } = renderConProveedores('/admin/eventos/nuevo', { usuario: 'admin' })
    const peticiones = registrarPeticiones()
    await llenarFormulario(user)
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/eventos/NEW-2027'))
    expect(await screen.findByText('DRAFT')).toBeInTheDocument()
    const post = peticiones.find((p) => p.metodo === 'POST' && p.ruta === '/api/events')
    await waitFor(() =>
      expect(post?.cuerpo).toEqual({
        eventCode: 'NEW-2027',
        name: 'Festival Nuevo 2027',
        description: null,
        category: 'MUSIC',
        eventDate: '2027-03-01T20:00',
        minimumAge: 18,
        venueCode: 'VEN-SMR-01',
      }),
    )

    await router.navigate('/admin/eventos')
    const lista = await screen.findByRole('heading', { name: 'Creados en esta sesión' })
    expect(within(lista.parentElement as HTMLElement).getByText('NEW-2027')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-003: 400 con details → errores en los campos', async () => {
    servidor.use(
      http.post('*/api/events', () =>
        HttpResponse.json(
          {
            status: 400,
            message: 'Validation failed',
            details: { name: 'Event name is required', eventDate: 'Event date is required' },
          },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderConProveedores('/admin/eventos/nuevo', { usuario: 'admin' })
    await llenarFormulario(user)
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(await screen.findByText('Event name is required')).toBeInTheDocument()
    expect(screen.getByText('Event date is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true')
  })

  it('409 (código duplicado) → aviso arriba del formulario', async () => {
    const { user } = renderConProveedores('/admin/eventos/nuevo', { usuario: 'admin' })
    await llenarFormulario(user)
    await user.clear(screen.getByLabelText('Código del evento'))
    await user.type(screen.getByLabelText('Código del evento'), 'CMF-2026')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un evento con ese código.',
    )
  })
})

describe('Gestionar evento — /admin/eventos/:eventCode', () => {
  it('TEST-FE-ADM-004: publicar evento → badge PUBLISHED (AC-FE-017)', async () => {
    const { user, router } = renderConProveedores('/admin/eventos/DRAFT-2027', { usuario: 'admin' })
    expect(await screen.findByText('DRAFT')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Publicar evento' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Publicar evento' })
    await user.click(within(dialogo).getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByText('PUBLISHED')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar evento' })).toBeDisabled()

    // El evento aparece en la cartelera (se invalidó ['eventos','publicados']).
    await router.navigate('/eventos')
    expect(await screen.findByText('Festival Borrador')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-005: publicar → 409 visible', async () => {
    servidor.use(
      http.patch('*/api/events/:codigo/publish', () =>
        HttpResponse.json(
          { status: 409, message: 'Cannot publish an event whose date is not in the future.' },
          { status: 409 },
        ),
      ),
    )
    const { user } = renderConProveedores('/admin/eventos/DRAFT-2027', { usuario: 'admin' })
    await user.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    const dialogo = await screen.findByRole('dialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Publicar' }))
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'No se puede publicar un evento cuya fecha ya pasó.',
    )
  })

  it('TEST-FE-ADM-006: asociar artista → aparece en la lista; duplicado → 409', async () => {
    const { user } = renderConProveedores('/admin/eventos/DRAFT-2027', { usuario: 'admin' })
    await screen.findByText('Aún no hay artistas asociados.')
    const selector = screen.getByLabelText('Agregar artista')
    await waitFor(() => expect(selector).toBeEnabled())
    await user.selectOptions(selector, 'Caribbean Sound')
    await user.click(screen.getByRole('button', { name: 'Asociar' }))

    const seccion = screen.getByRole('heading', { name: 'Artistas asociados' })
      .parentElement as HTMLElement
    expect(
      await within(seccion).findByRole('link', { name: /Caribbean Sound/ }),
    ).toBeInTheDocument()
    // En la UI el artista ya asociado queda bloqueado en el selector.
    expect(screen.getByRole('option', { name: 'Caribbean Sound (ya asociado)' })).toBeDisabled()

    // Si de todos modos el backend responde 409 (p. ej. otra pestaña), se muestra el mensaje.
    servidor.use(
      http.post('*/api/events/:codigo/artists/:id', () =>
        HttpResponse.json(
          { status: 409, message: 'Artist is already associated with this event.' },
          { status: 409 },
        ),
      ),
    )
    await user.selectOptions(selector, 'Solar Beat')
    await user.click(screen.getByRole('button', { name: 'Asociar' }))
    expect(
      await screen.findByText('El artista ya está asociado a este evento.'),
    ).toBeInTheDocument()
  })

  it('buscar evento por código desde /admin/eventos abre la gestión', async () => {
    const { user, router } = renderConProveedores('/admin/eventos', { usuario: 'admin' })
    await user.type(await screen.findByLabelText('Buscar evento por código'), 'CMF-2026{Enter}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/eventos/CMF-2026'))
    expect(await screen.findByText(/Caribbean Music Fest 2026/)).toBeInTheDocument()
  })
})
