import type { EventoResumen } from '../tipos'
import TarjetaEvento from './TarjetaEvento'

export default function GrillaEventos({ eventos }: { eventos: EventoResumen[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {eventos.map((evento) => (
        <li key={evento.eventCode}>
          <TarjetaEvento evento={evento} />
        </li>
      ))}
    </ul>
  )
}
