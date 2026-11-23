import { useState } from 'react'
import Boton from '../../../componentes/Boton'
import { IconoCopiar } from '../../../componentes/Iconos'

/** Copia el código del ticket (el QR está fuera de alcance, §9.12). */
export default function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false)
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }
  return (
    <Boton variante="secundario" onClick={() => void copiar()}>
      <IconoCopiar className="size-4" />
      <span aria-live="polite">{copiado ? 'Copiado' : 'Copiar'}</span>
    </Boton>
  )
}
