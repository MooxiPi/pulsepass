import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconoCerrar } from './Iconos'

interface PropsModal {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  /** Botones de acción del pie. */
  acciones?: ReactNode
}

const SELECTOR_FOCO =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Diálogo accesible: atrapa el foco, cierra con Esc y devuelve el foco al disparador. */
export default function Modal({ abierto, titulo, onCerrar, children, acciones }: PropsModal) {
  const idTitulo = useId()
  const panel = useRef<HTMLDivElement>(null)
  const cerrar = useRef(onCerrar)

  useEffect(() => {
    cerrar.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const nodo = panel.current
    const enfocables = () => Array.from(nodo?.querySelectorAll<HTMLElement>(SELECTOR_FOCO) ?? [])
    ;(enfocables()[0] ?? nodo)?.focus()

    function alPresionar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        cerrar.current()
        return
      }
      if (evento.key !== 'Tab') return
      const lista = enfocables()
      const primero = lista[0]
      const ultimo = lista[lista.length - 1]
      if (!primero || !ultimo) return
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', alPresionar)
    return () => {
      document.removeEventListener('keydown', alPresionar)
      anterior?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50" aria-hidden="true" onClick={onCerrar} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 id={idTitulo} className="text-lg font-semibold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800"
          >
            <IconoCerrar />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">{children}</div>
        {acciones ? (
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end dark:border-slate-800">
            {acciones}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
