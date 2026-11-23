import { useNavigate, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import CodigoTexto from '../componentes/CodigoTexto'
import ErrorConsulta from '../componentes/ErrorConsulta'
import EstadoVacio from '../componentes/EstadoVacio'
import MensajePagina from '../componentes/MensajePagina'
import PrecioCOP from '../componentes/PrecioCOP'
import Tabla, { type ColumnaTabla } from '../componentes/Tabla'
import { useNotificar } from '../componentes/notificacionesContexto'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { CodigoEventoSchema } from '../funcionalidades/eventos/tipos'
import BadgeEstadoTicket from '../funcionalidades/tickets/componentes/BadgeEstadoTicket'
import BuscadorCodigo from '../componentes/BuscadorCodigo'
import { useTicketsPagadosPorEvento, useUsarTicket } from '../funcionalidades/tickets/hooks'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import Pagina from '../layouts/Pagina'
import { mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

const EVENTO_NO_ENCONTRADO = (
  <MensajePagina
    codigo="404"
    titulo="Evento no encontrado"
    descripcion="Revisa el código del evento."
  />
)

/** Tickets pagados por evento — /staff/eventos/:eventCode/tickets (§9.15). */
export default function TicketsPagadosEvento() {
  const navigate = useNavigate()
  const notificar = useNotificar()
  const parametro = CodigoEventoSchema.safeParse(useParams().eventCode)
  const eventCode = parametro.success ? parametro.data : null
  // GET /api/events/{eventCode}: confirma que el evento existe (404 de evento) y aporta el nombre.
  const evento = useEvento(eventCode)
  const tickets = useTicketsPagadosPorEvento(eventCode)
  const usar = useUsarTicket()

  const columnas: ColumnaTabla<Ticket>[] = [
    { encabezado: 'Código', celda: (t) => <CodigoTexto>{t.ticketCode}</CodigoTexto> },
    { encabezado: 'Tipo', celda: (t) => t.type },
    { encabezado: 'Titular', celda: (t) => <span className="break-all">{t.userEmail}</span> },
    { encabezado: 'Precio', celda: (t) => <PrecioCOP valor={t.price} /> },
    { encabezado: 'Estado', celda: (t) => <BadgeEstadoTicket estado={t.status} /> },
    {
      encabezado: 'Acción',
      celda: (t) => (
        <Boton
          variante="secundario"
          cargando={usar.isPending && usar.variables === t.ticketCode}
          onClick={() =>
            usar.mutate(t.ticketCode, {
              onSuccess: () => notificar('exito', `Ingreso registrado: ${t.ticketCode}.`),
            })
          }
        >
          Usar
        </Boton>
      ),
    },
  ]

  return (
    <Pagina className="space-y-6">
      <title>Tickets pagados · PulsePass</title>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Tickets pagados · <CodigoTexto>{eventCode ?? ''}</CodigoTexto>
          </h1>
          {evento.data ? (
            <p className="text-slate-600 dark:text-slate-400">{evento.data.name}</p>
          ) : null}
        </div>
        <div className="md:w-96">
          <BuscadorCodigo
            etiqueta="Evento"
            textoBoton="Ir"
            placeholder="CMF-2026"
            onBuscar={(codigo) => navigate(RUTAS.ticketsPagados(codigo))}
          />
        </div>
      </div>

      {usar.isError ? <Aviso tono="advertencia">{mensajeDeError(usar.error)}</Aviso> : null}

      {!eventCode ? (
        EVENTO_NO_ENCONTRADO
      ) : evento.isError ? (
        <ErrorConsulta error={evento.error} noEncontrado={EVENTO_NO_ENCONTRADO} />
      ) : tickets.isPending ? (
        <Cargando forma="lista" etiqueta="Cargando tickets…" />
      ) : tickets.isError ? (
        <ErrorConsulta
          error={tickets.error}
          noEncontrado={EVENTO_NO_ENCONTRADO}
          onReintentar={() => void tickets.refetch()}
        />
      ) : tickets.data.length === 0 ? (
        <EstadoVacio titulo="No hay tickets pagados" />
      ) : (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total: {tickets.data.length}</p>
          <Tabla
            titulo={`Tickets pagados de ${eventCode}`}
            columnas={columnas}
            filas={tickets.data}
            claveFila={(t) => t.ticketCode}
          />
        </>
      )}
    </Pagina>
  )
}
