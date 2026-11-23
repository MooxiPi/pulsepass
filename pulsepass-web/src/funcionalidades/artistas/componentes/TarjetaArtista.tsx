import { Link } from 'react-router'
import Avatar from '../../../componentes/Avatar'
import { RUTAS } from '../../../lib/rutas'
import type { Artista } from '../tipos'

export default function TarjetaArtista({ artista }: { artista: Artista }) {
  return (
    <Link
      to={RUTAS.artista(artista.id)}
      className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <Avatar nombre={artista.stageName} tamano="mediano" />
      <span className="font-titulo font-semibold">{artista.stageName}</span>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {[artista.genre, artista.country].filter(Boolean).join(' · ') || 'Artista'}
      </span>
    </Link>
  )
}
