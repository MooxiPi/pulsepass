import clsx from 'clsx'
import { iniciales } from '../lib/formato'

type TamanoAvatar = 'pequeno' | 'mediano' | 'grande'
const TAMANOS: Record<TamanoAvatar, string> = {
  pequeno: 'size-8 text-xs',
  mediano: 'size-12 text-base',
  grande: 'size-24 text-3xl',
}

/** Tonos rotativos (mapa completo) para diferenciar avatares por iniciales. */
const TONOS = [
  'bg-marca-100 text-marca-700 dark:bg-marca-700/40 dark:text-marca-100',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
  'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
] as const

function tonoPara(texto: string): string {
  let suma = 0
  for (const caracter of texto) suma += caracter.charCodeAt(0)
  return TONOS[suma % TONOS.length] ?? TONOS[0]
}

/** Avatar de iniciales (la API no entrega imágenes). Decorativo: el nombre va al lado. */
export default function Avatar({
  nombre,
  tamano = 'mediano',
}: {
  nombre: string
  tamano?: TamanoAvatar
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-titulo font-semibold',
        TAMANOS[tamano],
        tonoPara(nombre),
      )}
    >
      {iniciales(nombre)}
    </span>
  )
}
