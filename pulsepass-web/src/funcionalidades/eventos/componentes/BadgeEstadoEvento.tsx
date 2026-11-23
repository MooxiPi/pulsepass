import Badge from '../../../componentes/Badge'
import { TONO_ESTADO_EVENTO } from '../estilos'
import type { EventStatus } from '../tipos'

export default function BadgeEstadoEvento({ estado }: { estado: EventStatus }) {
  return <Badge tono={TONO_ESTADO_EVENTO[estado]}>{estado}</Badge>
}
