import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import Boton from '../../../componentes/Boton'
import EnlaceBoton from '../../../componentes/EnlaceBoton'
import Tarjeta from '../../../componentes/Tarjeta'
import { RUTAS, type EstadoLogin } from '../../../lib/rutas'
import { useAuth } from '../../auth/hooks'
import type { Evento, EventStatus } from '../../eventos/tipos'
import { useComprarTicket } from '../hooks'
import { CompraSchema, TicketTypeSchema, type CompraForm } from '../tipos'
import ModalConfirmarCompra from './ModalConfirmarCompra'

/** Motivo visible cuando la compra no está disponible por el estado del evento (FR-FE-EVT-005). */
const MOTIVO_NO_DISPONIBLE: Record<Exclude<EventStatus, 'PUBLISHED'>, string> = {
  DRAFT: 'El evento aún no está publicado.',
  SOLD_OUT: 'Entradas agotadas.',
  CANCELLED: 'El evento fue cancelado.',
  FINISHED: 'El evento ya finalizó.',
}

/**
 * Panel de compra (§9.5). Solo orquesta: el email sale de la sesión y el backend decide
 * edad mínima, capacidad y estado (los rechazos llegan como 409 al modal).
 */
export default function PanelCompra({ evento }: { evento: Evento }) {
  const { sesion, tieneRol } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const comprar = useComprarTicket()
  const [confirmando, setConfirmando] = useState(false)
  const { register, getValues } = useForm<CompraForm>({
    resolver: zodResolver(CompraSchema),
    defaultValues: { type: 'GENERAL' },
  })

  // STAFF/ADMIN no compran desde la UI (la API autoriza la compra solo a USER).
  if (sesion.estado === 'autenticado' && !tieneRol('USER')) return null

  const disponible = evento.status === 'PUBLISHED'
  const motivo = evento.status === 'PUBLISHED' ? null : MOTIVO_NO_DISPONIBLE[evento.status]
  const estadoLogin: EstadoLogin = { desde: location.pathname }

  function abrir() {
    comprar.reset()
    setConfirmando(true)
  }

  function confirmar() {
    if (sesion.estado !== 'autenticado') return
    const { type } = CompraSchema.parse(getValues())
    comprar.mutate(
      { userEmail: sesion.usuario.email, eventCode: evento.eventCode, type },
      { onSuccess: (ticket) => navigate(RUTAS.confirmacionCompra(ticket.ticketCode)) },
    )
  }

  const accion =
    sesion.estado !== 'autenticado' ? (
      <EnlaceBoton to={RUTAS.login} state={estadoLogin} tamano="grande" className="w-full">
        Inicia sesión para comprar
      </EnlaceBoton>
    ) : (
      <Boton tamano="grande" className="w-full" disabled={!disponible} onClick={abrir}>
        Comprar entrada
      </Boton>
    )

  return (
    <>
      <Tarjeta className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Entradas</h2>
        <fieldset className="space-y-2" disabled={!disponible}>
          <legend className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            Tipo de entrada
          </legend>
          {TicketTypeSchema.options.map((tipo) => (
            <label
              key={tipo}
              className={clsx(
                'flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-4 has-checked:border-marca-600 has-checked:bg-marca-50 has-focus-visible:outline-2 has-focus-visible:outline-marca-600 dark:border-slate-700 dark:has-checked:bg-slate-800',
                !disponible && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                value={tipo}
                className="size-4 accent-marca-600"
                {...register('type')}
              />
              {tipo}
            </label>
          ))}
        </fieldset>
        <div className="hidden md:block">{accion}</div>
        {motivo ? (
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{motivo}</p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            El precio lo define el sistema al confirmar.
          </p>
        )}
      </Tarjeta>

      {/* Móvil: barra inferior fija con la acción de compra (DES-07). */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95">
        {accion}
      </div>

      {sesion.estado === 'autenticado' ? (
        <ModalConfirmarCompra
          abierto={confirmando}
          nombreEvento={evento.name}
          tipo={getValues('type')}
          email={sesion.usuario.email}
          enviando={comprar.isPending}
          error={comprar.error}
          onConfirmar={confirmar}
          onCerrar={() => setConfirmando(false)}
        />
      ) : null}
    </>
  )
}
