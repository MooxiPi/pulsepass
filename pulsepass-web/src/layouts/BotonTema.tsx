import { useState } from 'react'
import { IconoLuna, IconoSol } from '../componentes/Iconos'
import { aplicarTema, temaActual, type Tema } from '../lib/tema'

/** Alterna claro/oscuro (FR-FE-GEN-004). */
export default function BotonTema() {
  const [tema, setTema] = useState<Tema>(temaActual)
  const siguiente: Tema = tema === 'oscuro' ? 'claro' : 'oscuro'
  return (
    <button
      type="button"
      onClick={() => {
        aplicarTema(siguiente)
        setTema(siguiente)
      }}
      aria-label={tema === 'oscuro' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {tema === 'oscuro' ? <IconoSol /> : <IconoLuna />}
    </button>
  )
}
