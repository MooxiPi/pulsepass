import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import Avatar from '../componentes/Avatar'
import { IconoChevronAbajo } from '../componentes/Iconos'
import { useAuth, useSalir } from '../funcionalidades/auth/hooks'
import type { UsuarioAutenticado } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'

const CLASE_ITEM =
  'block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800'

/** Botón con avatar de iniciales y menú: Mi cuenta · Mis tickets · Salir (§9.2). */
export default function MenuUsuario({ usuario }: { usuario: UsuarioAutenticado }) {
  const { tieneRol } = useAuth()
  const cerrarYSalir = useSalir()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const idMenu = useId()

  useEffect(() => {
    if (!abierto) return
    function alClic(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    function alTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', alClic)
    document.addEventListener('keydown', alTecla)
    return () => {
      document.removeEventListener('mousedown', alClic)
      document.removeEventListener('keydown', alTecla)
    }
  }, [abierto])

  function salir() {
    setAbierto(false)
    void cerrarYSalir()
  }

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idMenu}
        onClick={() => setAbierto((valor) => !valor)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 py-1 pr-3 pl-1 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <Avatar nombre={usuario.username} tamano="pequeno" />
        <span className="max-w-32 truncate">{usuario.username}</span>
        <IconoChevronAbajo className="size-4" />
        <span className="sr-only">Menú de usuario</span>
      </button>
      {abierto ? (
        <div
          id={idMenu}
          className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <Link to={RUTAS.cuenta} className={CLASE_ITEM} onClick={() => setAbierto(false)}>
            Mi cuenta
          </Link>
          {tieneRol('USER') ? (
            <Link to={RUTAS.misTickets} className={CLASE_ITEM} onClick={() => setAbierto(false)}>
              Mis tickets
            </Link>
          ) : null}
          <button type="button" className={CLASE_ITEM} onClick={salir}>
            Salir
          </button>
        </div>
      ) : null}
    </div>
  )
}
