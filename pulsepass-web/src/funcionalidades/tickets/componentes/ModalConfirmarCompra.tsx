import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Modal from '../../../componentes/Modal'
import { mensajeDeError } from '../../../lib/errores'
import { ApiError } from '../../../lib/http'
import type { TicketType } from '../tipos'

interface PropsModalCompra {
  abierto: boolean
  nombreEvento: string
  tipo: TicketType
  email: string
  enviando: boolean
  error: unknown
  onConfirmar: () => void
  onCerrar: () => void
}

function mensajeCompra(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) return 'Evento no disponible.'
  return mensajeDeError(error)
}

/** Resumen de la compra; el error del servidor (p. ej. 409 edad mínima) se muestra aquí. */
export default function ModalConfirmarCompra({
  abierto,
  nombreEvento,
  tipo,
  email,
  enviando,
  error,
  onConfirmar,
  onCerrar,
}: PropsModalCompra) {
  return (
    <Modal
      abierto={abierto}
      titulo="Confirmar compra"
      onCerrar={onCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton cargando={enviando} onClick={onConfirmar}>
            Confirmar
          </Boton>
        </>
      }
    >
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Evento</dt>
        <dd className="font-medium">{nombreEvento}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Tipo</dt>
        <dd className="font-medium">{tipo}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Cuenta</dt>
        <dd className="font-medium break-all">{email}</dd>
      </dl>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        El precio lo define el sistema al confirmar.
      </p>
      {error ? (
        <Aviso tono="error" titulo="No se pudo completar la compra">
          {mensajeCompra(error)}
        </Aviso>
      ) : null}
    </Modal>
  )
}
