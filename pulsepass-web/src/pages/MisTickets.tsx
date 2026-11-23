import { useState } from 'react'
import Cargando from '../componentes/Cargando'
import EnlaceBoton from '../componentes/EnlaceBoton'
import ErrorConsulta from '../componentes/ErrorConsulta'
import EstadoVacio from '../componentes/EstadoVacio'
import { IconoTicket } from '../componentes/Iconos'
import { useUsuarioActual } from '../funcionalidades/auth/hooks'
import FiltroEstadoTicket, {
  type FiltroTicket,
} from '../funcionalidades/tickets/componentes/FiltroEstadoTicket'
import ModalConfirmarCancelacion from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import TarjetaTicket from '../funcionalidades/tickets/componentes/TarjetaTicket'
import { useMisTickets } from '../funcionalidades/tickets/hooks'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import Pagina from '../layouts/Pagina'
import { RUTAS } from '../lib/rutas'

/** Mis tickets — /mis-tickets (§9.11). GAP-03: se consulta por el email de /api/auth/me. */
export default function MisTickets() {
  const usuario = useUsuarioActual()
  const tickets = useMisTickets(usuario.email)
  const [filtro, setFiltro] = useState<FiltroTicket>('TODOS')
  const [aCancelar, setACancelar] = useState<Ticket | null>(null)

  const visibles = (tickets.data ?? []).filter(
    (ticket) => filtro === 'TODOS' || ticket.status === filtro,
  )

  return (
    <Pagina className="space-y-6">
      <title>Mis tickets · PulsePass</title>
      <h1 className="text-3xl font-bold">Mis tickets</h1>
      <FiltroEstadoTicket valor={filtro} onCambiar={setFiltro} />
      {tickets.isPending ? (
        <Cargando forma="lista" etiqueta="Cargando tickets…" />
      ) : tickets.isError ? (
        <ErrorConsulta error={tickets.error} onReintentar={() => void tickets.refetch()} />
      ) : tickets.data.length === 0 ? (
        <EstadoVacio
          titulo="Aún no tienes tickets"
          icono={<IconoTicket className="size-6" />}
          accion={<EnlaceBoton to={RUTAS.eventos}>Ver cartelera</EnlaceBoton>}
        />
      ) : visibles.length === 0 ? (
        <EstadoVacio titulo="No hay tickets con este estado" />
      ) : (
        <ul className="space-y-4">
          {visibles.map((ticket) => (
            <li key={ticket.ticketCode}>
              <TarjetaTicket ticket={ticket} onCancelar={setACancelar} />
            </li>
          ))}
        </ul>
      )}
      <ModalConfirmarCancelacion ticket={aCancelar} onCerrar={() => setACancelar(null)} />
    </Pagina>
  )
}
