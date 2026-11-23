import CodigoTexto from '../../../componentes/CodigoTexto'
import EnlaceBoton from '../../../componentes/EnlaceBoton'
import { RUTAS } from '../../../lib/rutas'
import BadgeEstadoEvento from '../../eventos/componentes/BadgeEstadoEvento'
import { useEvento } from '../../eventos/hooks'
import type { EventoCreado } from '../eventosSesion'

/** El estado se consulta a la API (caché ['evento', code]); no se copia en estado local. */
export default function FilaEventoSesion({ evento }: { evento: EventoCreado }) {
  const { data } = useEvento(evento.eventCode)
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <CodigoTexto className="font-semibold">{evento.eventCode}</CodigoTexto> · {evento.name}
      </p>
      <div className="flex items-center gap-3">
        {data ? <BadgeEstadoEvento estado={data.status} /> : null}
        <EnlaceBoton variante="secundario" to={RUTAS.adminEvento(evento.eventCode)}>
          Gestionar
        </EnlaceBoton>
      </div>
    </li>
  )
}
