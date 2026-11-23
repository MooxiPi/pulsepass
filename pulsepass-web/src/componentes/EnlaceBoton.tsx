import clsx from 'clsx'
import { Link, type LinkProps } from 'react-router'
import {
  CLASES_BASE_BOTON,
  TAMANOS_BOTON,
  VARIANTES_BOTON,
  type TamanoBoton,
  type VarianteBoton,
} from './estilos'

interface PropsEnlaceBoton extends LinkProps {
  variante?: VarianteBoton
  tamano?: TamanoBoton
}

/** Link de navegación con apariencia de botón (misma tabla de variantes que Boton). */
export default function EnlaceBoton({
  variante = 'primario',
  tamano = 'normal',
  className,
  ...props
}: PropsEnlaceBoton) {
  return (
    <Link
      className={clsx(
        CLASES_BASE_BOTON,
        TAMANOS_BOTON[tamano],
        VARIANTES_BOTON[variante],
        className,
      )}
      {...props}
    />
  )
}
