import clsx from 'clsx'
import { useId, type ComponentProps } from 'react'
import EnvolturaCampo from './EnvolturaCampo'
import { CLASES_BORDE, CLASES_CONTROL, describedBy } from './estilos'

interface PropsAreaTexto extends ComponentProps<'textarea'> {
  etiqueta: string
  error?: string | undefined
  ayuda?: string | undefined
}

export default function AreaTexto({
  etiqueta,
  error,
  ayuda,
  id,
  className,
  ...props
}: PropsAreaTexto) {
  const generado = useId()
  const idCampo = id ?? generado
  return (
    <EnvolturaCampo id={idCampo} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <textarea
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(idCampo, error, ayuda)}
        className={clsx(
          CLASES_CONTROL,
          'py-2',
          error ? CLASES_BORDE.error : CLASES_BORDE.normal,
          className,
        )}
        {...props}
      />
    </EnvolturaCampo>
  )
}
