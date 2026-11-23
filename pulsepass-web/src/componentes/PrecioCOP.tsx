import { formatearPrecio } from '../lib/formato'

/** Precio en pesos colombianos con Intl.NumberFormat('es-CO', COP). */
export default function PrecioCOP({ valor }: { valor: number }) {
  return <span className="tabular-nums">{formatearPrecio(valor)}</span>
}
