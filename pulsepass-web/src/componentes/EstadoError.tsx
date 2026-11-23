import Boton from './Boton'
import { IconoAlerta } from './Iconos'

interface PropsEstadoError {
  mensaje: string
  onReintentar?: () => void
}

/** Mensaje de error de carga + botón "Reintentar" (refetch). */
export default function EstadoError({ mensaje, onReintentar }: PropsEstadoError) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      <IconoAlerta className="size-8" />
      <p className="font-medium">{mensaje}</p>
      {onReintentar ? (
        <Boton variante="secundario" onClick={onReintentar}>
          Reintentar
        </Boton>
      ) : null}
    </div>
  )
}
