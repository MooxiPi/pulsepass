import { useState } from 'react'
import { useParams } from 'react-router'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import CodigoTexto from '../componentes/CodigoTexto'
import EnlaceBoton from '../componentes/EnlaceBoton'
import EnlaceVolver from '../componentes/EnlaceVolver'
import ErrorConsulta from '../componentes/ErrorConsulta'
import MensajePagina from '../componentes/MensajePagina'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import BadgeEstadoTicket from '../funcionalidades/tickets/componentes/BadgeEstadoTicket'
import BotonCopiar from '../funcionalidades/tickets/componentes/BotonCopiar'
import ModalConfirmarCancelacion from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { CodigoTicketSchema } from '../funcionalidades/tickets/tipos'
import Pagina from '../layouts/Pagina'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const NO_DISPONIBLE = (
  <MensajePagina
    titulo="Ticket no disponible"
    descripcion="No encontramos este ticket entre los tuyos."
    acciones={<EnlaceBoton to={RUTAS.misTickets}>Ver mis tickets</EnlaceBoton>}
  />
)

/** Detalle de ticket — /mis-tickets/:ticketCode (§9.12). Ajeno o inexistente: "no disponible". */
export default function DetalleTicket() {
  const parametro = CodigoTicketSchema.safeParse(useParams().ticketCode)
  const ticketCode = parametro.success ? parametro.data : null
  const ticket = useTicket(ticketCode)
  const [cancelando, setCancelando] = useState(false)

  return (
    <Pagina estrecha className="space-y-4">
      <title>Detalle de ticket · PulsePass</title>
      <EnlaceVolver a={RUTAS.misTickets}>Mis tickets</EnlaceVolver>
      {!ticketCode ? (
        NO_DISPONIBLE
      ) : ticket.isPending ? (
        <Cargando forma="detalle" etiqueta="Cargando ticket…" />
      ) : ticket.isError ? (
        // 403/404 → misma pantalla, sin revelar si el ticket existe (AC-FE-014).
        <ErrorConsulta
          error={ticket.error}
          noEncontrado={NO_DISPONIBLE}
          ocultar403
          onReintentar={() => void ticket.refetch()}
        />
      ) : (
        <>
          <Tarjeta className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <h1 className="text-2xl font-bold">{ticket.data.eventName}</h1>
              <BadgeEstadoTicket estado={ticket.data.status} />
            </div>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3">
              <dt className="text-slate-500 dark:text-slate-400">Código</dt>
              <dd className="flex flex-wrap items-center gap-3">
                <CodigoTexto className="text-lg font-semibold">
                  {ticket.data.ticketCode}
                </CodigoTexto>
                <BotonCopiar texto={ticket.data.ticketCode} />
              </dd>
              <dt className="text-slate-500 dark:text-slate-400">Tipo</dt>
              <dd className="font-medium">{ticket.data.type}</dd>
              <dt className="text-slate-500 dark:text-slate-400">Precio</dt>
              <dd className="font-medium">
                <PrecioCOP valor={ticket.data.price} />
              </dd>
              <dt className="text-slate-500 dark:text-slate-400">Comprado el</dt>
              <dd className="font-medium">{formatearFechaHora(ticket.data.purchaseDate)}</dd>
              <dt className="text-slate-500 dark:text-slate-400">Titular</dt>
              <dd className="font-medium break-all">{ticket.data.userEmail}</dd>
            </dl>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Presenta este código en el ingreso.
            </p>
          </Tarjeta>
          {ticket.data.status === 'PAID' ? (
            <div className="flex justify-end">
              <Boton variante="peligro" onClick={() => setCancelando(true)}>
                Cancelar ticket
              </Boton>
            </div>
          ) : null}
          <ModalConfirmarCancelacion
            ticket={cancelando ? ticket.data : null}
            onCerrar={() => setCancelando(false)}
          />
        </>
      )}
    </Pagina>
  )
}
