import Badge, { type TonoBadge } from '../../../componentes/Badge'
import type { TicketStatus } from '../tipos'

const TONO_ESTADO_TICKET: Record<TicketStatus, TonoBadge> = {
  RESERVED: 'azul',
  PAID: 'verde',
  USED: 'grisOscuro',
  CANCELLED: 'rojo',
}

export default function BadgeEstadoTicket({ estado }: { estado: TicketStatus }) {
  return <Badge tono={TONO_ESTADO_TICKET[estado]}>{estado}</Badge>
}
