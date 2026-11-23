import { Link } from 'react-router'
import Avatar from '../../../componentes/Avatar'
import { RUTAS } from '../../../lib/rutas'
import type { Artista } from '../tipos'

interface PropsAvatarArtista {
  artista: Pick<Artista, 'id' | 'stageName'>
  tamano?: 'pequeno' | 'mediano'
}

/** Avatar de iniciales + nombre, enlazado al detalle del artista. */
export default function AvatarArtista({ artista, tamano = 'mediano' }: PropsAvatarArtista) {
  return (
    <Link
      to={RUTAS.artista(artista.id)}
      className="inline-flex items-center gap-3 rounded-full pr-3 font-medium hover:text-marca-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
    >
      <Avatar nombre={artista.stageName} tamano={tamano} />
      {artista.stageName}
    </Link>
  )
}
