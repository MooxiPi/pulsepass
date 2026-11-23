/** Formatos es-CO (PRD NFR: Intl.DateTimeFormat / Intl.NumberFormat). */

const LOCALE = 'es-CO'

const fecha = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
const hora = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false })
const fechaNumerica = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const moneda = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/**
 * La API envía LocalDateTime sin zona ("2026-12-12T20:00:00", a veces con microsegundos:
 * "2027-11-08T14:47:38.913845") y LocalDate ("1998-04-12"). Se interpretan como hora local;
 * una fecha sola se ancla a medianoche local. Las fracciones se recortan a milisegundos
 * porque el formato estándar de Date solo admite 3 decimales (Safari rechaza más).
 */
export function aFecha(valor: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return new Date(`${valor}T00:00:00`)
  return new Date(valor.replace(/(\.\d{3})\d+/, '$1'))
}

/** "12 dic 2026" (el ICU de es-CO produce "12 de dic de 2026"; el diseño usa la forma corta). */
export function formatearFecha(valor: string): string {
  const partes = fecha.formatToParts(aFecha(valor))
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value.replace(/\./g, '') ?? ''
  return `${parte('day')} ${parte('month')} ${parte('year')}`
}

/** "5 nov 2026 14:32" */
export const formatearFechaHora = (valor: string) =>
  `${formatearFecha(valor)} ${formatearHora(valor)}`
export const formatearHora = (valor: string) => hora.format(aFecha(valor))
export const formatearFechaNumerica = (valor: string) => fechaNumerica.format(aFecha(valor))
export const formatearPrecio = (valor: number) => moneda.format(valor)

/** Iniciales para avatares ("Solar Beat" → "SB"). */
export function iniciales(texto: string): string {
  return texto
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('')
}
