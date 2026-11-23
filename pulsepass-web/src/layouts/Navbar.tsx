import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import EnlaceBoton from '../componentes/EnlaceBoton'
import { IconoCerrar, IconoMenu, IconoMusica } from '../componentes/Iconos'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'
import BotonTema from './BotonTema'
import { ENLACES_POR_ROL, ENLACES_PUBLICOS, type EnlaceNav } from './enlacesNavegacion'
import MenuUsuario from './MenuUsuario'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-marca-600',
    isActive
      ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  )

/** Navbar adaptada al rol (tabla 8.4) con menú móvil (< md). */
export default function Navbar() {
  const { sesion, tieneRol } = useAuth()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [rutaDelMenu, setRutaDelMenu] = useState(location.pathname)

  // Cerrar el menú móvil al navegar (ajuste de estado durante el render, sin efecto).
  if (rutaDelMenu !== location.pathname) {
    setRutaDelMenu(location.pathname)
    setMenuAbierto(false)
  }

  useEffect(() => {
    if (!menuAbierto) return
    const alTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('keydown', alTecla)
    return () => document.removeEventListener('keydown', alTecla)
  }, [menuAbierto])

  const enlaces: EnlaceNav[] = [
    ...ENLACES_PUBLICOS,
    ...ENLACES_POR_ROL.filter((enlace) => !enlace.roles || tieneRol(...enlace.roles)),
  ]
  const anonimo = sesion.estado !== 'autenticado'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          to={RUTAS.inicio}
          className="flex items-center gap-2 rounded-lg font-titulo text-xl font-bold focus-visible:outline-2 focus-visible:outline-marca-600"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-marca-600 text-white">
            <IconoMusica className="size-5" />
          </span>
          PulsePass
        </Link>

        <nav aria-label="Principal" className="hidden flex-1 md:block">
          <ul className="flex items-center gap-1">
            {enlaces.map((enlace) => (
              <li key={enlace.a}>
                <NavLink to={enlace.a} end={enlace.fin ?? false} className={claseEnlace}>
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <BotonTema />
          {sesion.estado === 'autenticado' ? (
            <div className="hidden md:block">
              <MenuUsuario usuario={sesion.usuario} />
            </div>
          ) : sesion.estado === 'anonimo' ? (
            <div className="hidden items-center gap-2 md:flex">
              <EnlaceBoton variante="fantasma" to={RUTAS.login}>
                Ingresar
              </EnlaceBoton>
              <EnlaceBoton to={RUTAS.registro}>Registrarse</EnlaceBoton>
            </div>
          ) : null}
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 md:hidden dark:hover:bg-slate-800"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto((valor) => !valor)}
          >
            {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
        </div>
      </div>

      {menuAbierto ? (
        <nav
          id="menu-movil"
          aria-label="Menú móvil"
          className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800"
        >
          <ul className="flex flex-col gap-1">
            {enlaces.map((enlace) => (
              <li key={enlace.a}>
                <NavLink to={enlace.a} end={enlace.fin ?? false} className={claseEnlace}>
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
            {anonimo ? (
              <li className="mt-2 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <EnlaceBoton variante="secundario" to={RUTAS.login} className="flex-1">
                  Ingresar
                </EnlaceBoton>
                <EnlaceBoton to={RUTAS.registro} className="flex-1">
                  Registrarse
                </EnlaceBoton>
              </li>
            ) : (
              <li className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <NavLink to={RUTAS.cuenta} className={claseEnlace}>
                  Mi cuenta
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
