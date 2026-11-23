import Boton from '../../../componentes/Boton'
import CodigoTexto from '../../../componentes/CodigoTexto'
import EnlaceBoton from '../../../componentes/EnlaceBoton'
import PrecioCOP from '../../../componentes/PrecioCOP'
import Tarjeta from '../../../componentes/Tarjeta'
import { formatearFecha } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { Ticket } from '../tipos'
import BadgeEstadoTicket from './BadgeEstadoTicket'

interface PropsTarjetaTicket {
  ticket: Ticket
  onCancelar: (ticket: Ticket) => void
}

export default function TarjetaTicket({ ticket, onCancelar }: PropsTarjetaTicket) {
  return (
    <Tarjeta className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{ticket.eventName}</h2>
          <BadgeEstadoTicket estado={ticket.status} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <CodigoTexto>{ticket.ticketCode}</CodigoTexto> · {ticket.type} ·{' '}
          <PrecioCOP valor={ticket.price} /> · {formatearFecha(ticket.purchaseDate)}
        </p>
      </div>
      <div className="flex gap-2">
        <EnlaceBoton variante="secundario" to={RUTAS.ticket(ticket.ticketCode)}>
          Ver detalle
        </EnlaceBoton>
        {/* Visible solo si PAID (experiencia de usuario); el backend sigue siendo la autoridad. */}
        {ticket.status === 'PAID' ? (
          <Boton variante="peligro" onClick={() => onCancelar(ticket)}>
            Cancelar
          </Boton>
        ) : null}
      </div>
    </Tarjeta>
  )
}
