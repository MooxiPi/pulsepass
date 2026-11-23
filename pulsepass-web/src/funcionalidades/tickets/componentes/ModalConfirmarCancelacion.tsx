import { useEffect } from 'react'
import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import CodigoTexto from '../../../componentes/CodigoTexto'
import Modal from '../../../componentes/Modal'
import { useNotificar } from '../../../componentes/notificacionesContexto'
import { mensajeDeError } from '../../../lib/errores'
import { useCancelarTicket } from '../hooks'
import type { Ticket } from '../tipos'

interface PropsModalCancelacion {
  ticket: Ticket | null
  onCerrar: () => void
}

/** Confirmación de cancelación; un 409 se muestra dentro del modal sin cerrarlo (DES-10). */
export default function ModalConfirmarCancelacion({ ticket, onCerrar }: PropsModalCancelacion) {
  const cancelar = useCancelarTicket()
  const notificar = useNotificar()
  const { reset } = cancelar

  useEffect(() => {
    reset()
  }, [ticket, reset])

  if (!ticket) return null

  function confirmar() {
    if (!ticket) return
    cancelar.mutate(ticket.ticketCode, {
      onSuccess: () => {
        notificar('exito', 'Ticket cancelado.')
        onCerrar()
      },
    })
  }

  return (
    <Modal
      abierto
      titulo="Cancelar ticket"
      onCerrar={onCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={onCerrar}>
            Volver
          </Boton>
          <Boton variante="peligro" cargando={cancelar.isPending} onClick={confirmar}>
            Cancelar ticket
          </Boton>
        </>
      }
    >
      <p>
        ¿Seguro que quieres cancelar el ticket <CodigoTexto>{ticket.ticketCode}</CodigoTexto> de{' '}
        <strong>{ticket.eventName}</strong>? Esta acción no se puede deshacer.
      </p>
      {cancelar.isError ? <Aviso tono="error">{mensajeDeError(cancelar.error)}</Aviso> : null}
    </Modal>
  )
}
