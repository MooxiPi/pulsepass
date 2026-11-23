import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderConProveedores, type UsuarioDemo } from '../test/utils'

async function enlacesPrincipales(usuario?: UsuarioDemo) {
  renderConProveedores('/', usuario ? { usuario } : {})
  const nav = await screen.findByRole('navigation', { name: 'Principal' })
  if (usuario) await within(screen.getByRole('banner')).findByText(usuario)
  return within(nav)
    .getAllByRole('link')
    .map((enlace) => enlace.textContent)
}

describe('Navbar por rol (TEST-FE-GEN-003, tabla 8.4)', () => {
  it('anónimo: catálogo + Ingresar/Registrarse', async () => {
    expect(await enlacesPrincipales()).toEqual(['Eventos', 'Artistas', 'Sedes'])
    expect(screen.getAllByRole('link', { name: 'Ingresar' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Registrarse' }).length).toBeGreaterThan(0)
  })

  it('USER: añade Mis tickets', async () => {
    expect(await enlacesPrincipales('andrea')).toEqual([
      'Eventos',
      'Artistas',
      'Sedes',
      'Mis tickets',
    ])
    expect(screen.queryByRole('link', { name: 'Ingresar' })).not.toBeInTheDocument()
  })

  it('STAFF: validación y tickets pagados', async () => {
    expect(await enlacesPrincipales('staff')).toEqual([
      'Eventos',
      'Artistas',
      'Sedes',
      'Validar ingreso',
      'Tickets pagados',
    ])
  })

  it('ADMIN: además administrar eventos', async () => {
    expect(await enlacesPrincipales('admin')).toEqual([
      'Eventos',
      'Artistas',
      'Sedes',
      'Validar ingreso',
      'Tickets pagados',
      'Administrar eventos',
    ])
  })
})

describe('Menú móvil (TEST-FE-GEN-004)', () => {
  it('abre y cierra con teclado', async () => {
    const { user } = renderConProveedores('/')
    const boton = await screen.findByRole('button', { name: 'Abrir menú' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')

    boton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('navigation', { name: 'Menú móvil' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('navigation', { name: 'Menú móvil' })).not.toBeInTheDocument()

    screen.getByRole('button', { name: 'Abrir menú' }).focus()
    await user.keyboard(' ')
    expect(screen.getByRole('navigation', { name: 'Menú móvil' })).toBeInTheDocument()
    await user.keyboard(' ')
    expect(screen.queryByRole('navigation', { name: 'Menú móvil' })).not.toBeInTheDocument()
  })

  it('NavLink activo marca la página actual', async () => {
    renderConProveedores('/sedes')
    const nav = await screen.findByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('link', { name: 'Sedes' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Eventos' })).not.toHaveAttribute('aria-current')
  })
})
