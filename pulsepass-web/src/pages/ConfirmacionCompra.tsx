import { useParams } from 'react-router'
import Cargando from '../componentes/Cargando'
import CodigoTexto from '../componentes/CodigoTexto'
import EnlaceBoton from '../componentes/EnlaceBoton'
import ErrorConsulta from '../componentes/ErrorConsulta'
import { IconoCheck } from '../componentes/Iconos'
import MensajePagina from '../componentes/MensajePagina'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import BadgeEstadoTicket from '../funcionalidades/tickets/componentes/BadgeEstadoTicket'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { CodigoTicketSchema } from '../funcionalidades/tickets/tipos'
import Pagina from '../layouts/Pagina'
import { RUTAS } from '../lib/rutas'

const NO_DISPONIBLE = <MensajePagina titulo="Ticket no disponible" />

/** Confirmación de compra — /compra/confirmacion/:ticketCode (§9.13). */
export default function ConfirmacionCompra() {
  const parametro = CodigoTicketSchema.safeParse(useParams().ticketCode)
  const ticketCode = parametro.success ? parametro.data : null
  const ticket = useTicket(ticketCode)

  return (
    <Pagina estrecha>
      <title>Compra realizada · PulsePass</title>
      {!ticketCode ? (
        NO_DISPONIBLE
      ) : ticket.isPending ? (
        <Cargando forma="detalle" etiqueta="Cargando compra…" />
      ) : ticket.isError ? (
        <ErrorConsulta
          error={ticket.error}
          noEncontrado={NO_DISPONIBLE}
          ocultar403
          onReintentar={() => void ticket.refetch()}
        />
      ) : (
        <Tarjeta className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
            <IconoCheck className="size-8" />
          </span>
          <h1 className="text-2xl font-bold">¡Compra realizada con éxito!</h1>
          <p className="text-lg font-semibold">{ticket.data.eventName}</p>
          <p className="flex flex-wrap items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
            Ticket <CodigoTexto>{ticket.data.ticketCode}</CodigoTexto> · {ticket.data.type} ·{' '}
            <PrecioCOP valor={ticket.data.price} />
            <BadgeEstadoTicket estado={ticket.data.status} />
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <EnlaceBoton to={RUTAS.misTickets}>Ver mis tickets</EnlaceBoton>
            <EnlaceBoton variante="secundario" to={RUTAS.eventos}>
              Seguir explorando
            </EnlaceBoton>
          </div>
        </Tarjeta>
      )}
    </Pagina>
  )
}
