import { useState, type FormEvent } from 'react'
import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Selector from '../../../componentes/Selector'
import { useNotificar } from '../../../componentes/notificacionesContexto'
import { mensajeDeError } from '../../../lib/errores'
import AvatarArtista from '../../artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../../artistas/hooks'
import { useAsociarArtista } from '../../eventos/hooks'
import type { Evento } from '../../eventos/tipos'

/**
 * Asociar artista activo. Los ya asociados se bloquean en el selector (UX);
 * el backend sigue siendo la autoridad y responde 409 si hay duplicado.
 */
export default function PanelArtistasEvento({ evento }: { evento: Evento }) {
  const artistas = useArtistasActivos()
  const asociar = useAsociarArtista()
  const notificar = useNotificar()
  const [seleccion, setSeleccion] = useState('')

  const asociados = new Set(evento.artists.map((artista) => artista.id))
  const artistaElegido = artistas.data?.find((artista) => String(artista.id) === seleccion)

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!artistaElegido) return
    asociar.mutate(
      {
        eventCode: evento.eventCode,
        artistId: artistaElegido.id,
        stageName: artistaElegido.stageName,
      },
      {
        onSuccess: () => {
          setSeleccion('')
          notificar('exito', `${artistaElegido.stageName} asociado al evento.`)
        },
      },
    )
  }

  return (
    <section aria-labelledby="titulo-artistas" className="space-y-3">
      <h2 id="titulo-artistas" className="text-lg font-semibold">
        Artistas asociados
      </h2>
      {evento.artists.length ? (
        <ul className="flex flex-wrap gap-4">
          {evento.artists.map((artista) => (
            <li key={artista.id}>
              <AvatarArtista artista={artista} tamano="pequeno" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-600 dark:text-slate-400">Aún no hay artistas asociados.</p>
      )}
      <form onSubmit={enviar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Selector
            etiqueta="Agregar artista"
            value={seleccion}
            disabled={artistas.isPending}
            onChange={(e) => {
              asociar.reset()
              setSeleccion(e.target.value)
            }}
          >
            <option value="">
              {artistas.isPending ? 'Cargando artistas…' : 'Selecciona un artista'}
            </option>
            {artistas.data?.map((artista) => (
              <option key={artista.id} value={artista.id} disabled={asociados.has(artista.id)}>
                {artista.stageName}
                {asociados.has(artista.id) ? ' (ya asociado)' : ''}
              </option>
            ))}
          </Selector>
        </div>
        <Boton type="submit" disabled={!artistaElegido} cargando={asociar.isPending}>
          Asociar
        </Boton>
      </form>
      {artistas.isError ? <Aviso tono="error">{mensajeDeError(artistas.error)}</Aviso> : null}
      {asociar.isError ? <Aviso tono="error">{mensajeDeError(asociar.error)}</Aviso> : null}
    </section>
  )
}
