import clsx from 'clsx'
import { useId, type ComponentProps } from 'react'
import EnvolturaCampo from './EnvolturaCampo'
import { CLASES_BORDE, CLASES_CONTROL, describedBy } from './estilos'

interface PropsSelector extends ComponentProps<'select'> {
  etiqueta: string
  error?: string | undefined
  ayuda?: string | undefined
  ocultarEtiqueta?: boolean
}

export default function Selector({
  etiqueta,
  error,
  ayuda,
  ocultarEtiqueta = false,
  id,
  className,
  children,
  ...props
}: PropsSelector) {
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
      <select
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(idCampo, error, ayuda)}
        className={clsx(
          CLASES_CONTROL,
          error ? CLASES_BORDE.error : CLASES_BORDE.normal,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </EnvolturaCampo>
  )
}
