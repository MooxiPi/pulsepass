import { useState } from 'react'
import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Modal from '../../../componentes/Modal'
import { useNotificar } from '../../../componentes/notificacionesContexto'
import { mensajeDeError } from '../../../lib/errores'
import { usePublicarEvento } from '../../eventos/hooks'
import type { Evento } from '../../eventos/tipos'

/** Publicar con confirmación; deshabilitado si el estado no es DRAFT (§9.18). */
export default function PanelPublicacion({ evento }: { evento: Evento }) {
  const publicar = usePublicarEvento()
  const notificar = useNotificar()
  const [confirmando, setConfirmando] = useState(false)

  function confirmar() {
    publicar.mutate(evento.eventCode, {
      onSuccess: () => {
        setConfirmando(false)
        notificar('exito', 'Evento publicado.')
      },
    })
  }

  return (
    <section aria-labelledby="titulo-publicacion" className="space-y-3">
      <h2 id="titulo-publicacion" className="text-lg font-semibold">
        Publicación
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-600 dark:text-slate-400">
          El evento es visible al público una vez publicado.
        </p>
        <Boton
          disabled={evento.status !== 'DRAFT'}
          onClick={() => {
            publicar.reset()
            setConfirmando(true)
          }}
        >
          Publicar evento
        </Boton>
      </div>
      {publicar.isError && !confirmando ? (
        <Aviso tono="error">{mensajeDeError(publicar.error)}</Aviso>
      ) : null}
      <Modal
        abierto={confirmando}
        titulo="Publicar evento"
        onCerrar={() => setConfirmando(false)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </Boton>
            <Boton cargando={publicar.isPending} onClick={confirmar}>
              Publicar
            </Boton>
          </>
        }
      >
        <p>
          ¿Publicar <strong>{evento.name}</strong>? Quedará visible en la cartelera pública.
        </p>
        {publicar.isError ? <Aviso tono="error">{mensajeDeError(publicar.error)}</Aviso> : null}
      </Modal>
    </section>
  )
}
