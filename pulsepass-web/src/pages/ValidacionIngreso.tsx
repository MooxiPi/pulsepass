import { useState } from 'react'
import { useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import CodigoTexto from '../componentes/CodigoTexto'
import Tarjeta from '../componentes/Tarjeta'
import BadgeEstadoTicket from '../funcionalidades/tickets/componentes/BadgeEstadoTicket'
import BuscadorCodigo from '../componentes/BuscadorCodigo'
import { useBuscarTicket, useUsarTicket } from '../funcionalidades/tickets/hooks'
import Pagina from '../layouts/Pagina'
import { mensajeDeError } from '../lib/errores'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

function mensajeBusqueda(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) return 'Ticket no encontrado.'
  if (error instanceof ApiError && error.status === 403) return 'Sin permisos.'
  return mensajeDeError(error)
}

/** Validación de ingreso — /staff/validacion (§9.14). Resultado grande para uso en puerta. */
export default function ValidacionIngreso() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState<string | null>(null)
  const ticket = useBuscarTicket(codigo)
  const usar = useUsarTicket()

  function buscar(valor: string) {
    usar.reset()
    setCodigo(valor)
    if (valor === codigo) void ticket.refetch()
  }

  return (
    <Pagina estrecha className="space-y-8">
      <title>Validación de ingreso · PulsePass</title>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Validación de ingreso</h1>
        <BuscadorCodigo
          etiqueta="Código de ticket"
          textoBoton="Buscar"
          placeholder="TCK-8F2A1C"
          autoFocus
          limpiarCon={usar.isSuccess ? usar.data.ticketCode : undefined}
          onBuscar={buscar}
        />

        <div aria-live="polite" className="space-y-4">
          {codigo && ticket.isFetching && !ticket.data ? (
            <Cargando forma="lista" cantidad={1} />
          ) : null}
          {ticket.isError ? (
            <Aviso tono={esEstado404(ticket.error) ? 'advertencia' : 'error'}>
              <span className="text-base font-semibold">{mensajeBusqueda(ticket.error)}</span>
            </Aviso>
          ) : null}
          {ticket.data && !ticket.isError ? (
            <Tarjeta className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">{ticket.data.eventName}</h2>
                <BadgeEstadoTicket estado={ticket.data.status} />
              </div>
              <p className="text-lg">
                <CodigoTexto className="font-semibold">{ticket.data.ticketCode}</CodigoTexto> ·{' '}
                {ticket.data.type} · Titular: {ticket.data.userEmail}
              </p>
              <div className="flex justify-end">
                <Boton
                  tamano="grande"
                  cargando={usar.isPending}
                  onClick={() => usar.mutate(ticket.data.ticketCode)}
                >
                  Marcar como usado
                </Boton>
              </div>
            </Tarjeta>
          ) : null}
          {usar.isSuccess ? (
            <Aviso tono="exito">
              <span className="text-lg font-semibold">Ingreso registrado.</span>
            </Aviso>
          ) : null}
          {usar.isError ? (
            <Aviso tono="advertencia">
              <span className="text-lg font-semibold">{mensajeDeError(usar.error)}</span>
            </Aviso>
          ) : null}
        </div>
      </section>

      <section id="tickets-pagados" aria-labelledby="titulo-pagados" className="space-y-4">
        <h2 id="titulo-pagados" className="text-xl font-semibold">
          Tickets pagados por evento
        </h2>
        <BuscadorCodigo
          etiqueta="Código del evento"
          textoBoton="Ver tickets"
          placeholder="CMF-2026"
          onBuscar={(eventCode) => navigate(RUTAS.ticketsPagados(eventCode))}
        />
      </section>
    </Pagina>
  )
}

const esEstado404 = (error: unknown) => error instanceof ApiError && error.status === 404
