import clsx from 'clsx'
import { ESTILO_CATEGORIA } from '../estilos'
import type { EventCategory } from '../tipos'

export default function EtiquetaCategoria({ categoria }: { categoria: EventCategory }) {
  return (
    <span className={clsx('text-xs font-bold tracking-widest', ESTILO_CATEGORIA[categoria].texto)}>
      {categoria}
    </span>
  )
}
