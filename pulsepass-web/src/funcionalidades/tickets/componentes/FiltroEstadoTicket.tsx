import FiltroChips, { type OpcionChip } from '../../../componentes/FiltroChips'
import type { TicketStatus } from '../tipos'

export type FiltroTicket = 'TODOS' | Extract<TicketStatus, 'PAID' | 'USED' | 'CANCELLED'>

const OPCIONES: OpcionChip<FiltroTicket>[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PAID', etiqueta: 'Pagados' },
  { valor: 'USED', etiqueta: 'Usados' },
  { valor: 'CANCELLED', etiqueta: 'Cancelados' },
]

export default function FiltroEstadoTicket({
  valor,
  onCambiar,
}: {
  valor: FiltroTicket
  onCambiar: (valor: FiltroTicket) => void
}) {
  return (
    <FiltroChips
      etiqueta="Filtrar por estado"
      opciones={OPCIONES}
      seleccionado={valor}
      onCambiar={onCambiar}
    />
  )
}
