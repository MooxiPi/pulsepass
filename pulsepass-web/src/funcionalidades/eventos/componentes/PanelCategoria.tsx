import clsx from 'clsx'
import { ESTILO_CATEGORIA } from '../estilos'
import type { EventCategory } from '../tipos'

/** Panel de color con ícono por categoría, en lugar de foto (DES-02). */
export default function PanelCategoria({
  categoria,
  alto = 'normal',
}: {
  categoria: EventCategory
  alto?: 'normal' | 'grande'
}) {
  const estilo = ESTILO_CATEGORIA[categoria]
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'flex items-center justify-center',
        estilo.fondo,
        estilo.texto,
        alto === 'grande' ? 'h-48 md:h-56' : 'h-36',
      )}
    >
      {estilo.icono}
    </div>
  )
}
