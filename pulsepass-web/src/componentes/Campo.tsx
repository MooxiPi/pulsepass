import clsx from 'clsx'
import { useId, type ComponentProps, type ReactNode } from 'react'
import EnvolturaCampo from './EnvolturaCampo'
import { CLASES_BORDE, CLASES_CONTROL, describedBy } from './estilos'

interface PropsCampo extends ComponentProps<'input'> {
  etiqueta: string
  error?: string | undefined
  ayuda?: string | undefined
  ocultarEtiqueta?: boolean
  /** Contenido a la derecha del input (p. ej. botón mostrar contraseña). */
  accesorio?: ReactNode
  /** Ícono decorativo a la izquierda del input. */
  icono?: ReactNode
}

export default function Campo({
  etiqueta,
  error,
  ayuda,
  ocultarEtiqueta = false,
  accesorio,
  icono,
  id,
  className,
  ...props
}: PropsCampo) {
  const generado = useId()
  const idCampo = id ?? generado
  return (
    <EnvolturaCampo
      id={idCampo}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      ocultarEtiqueta={ocultarEtiqueta}
    >
      <div className="relative">
        {icono ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {icono}
          </span>
        ) : null}
        <input
          id={idCampo}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(idCampo, error, ayuda)}
          className={clsx(
            CLASES_CONTROL,
            error ? CLASES_BORDE.error : CLASES_BORDE.normal,
            icono && 'pl-10',
            accesorio && 'pr-12',
            className,
          )}
          {...props}
        />
        {accesorio ? (
          <span className="absolute inset-y-0 right-1 flex items-center">{accesorio}</span>
        ) : null}
      </div>
    </EnvolturaCampo>
  )
}
