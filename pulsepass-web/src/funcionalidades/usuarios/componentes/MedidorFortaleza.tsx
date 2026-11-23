import clsx from 'clsx'

type Nivel = 'debil' | 'media' | 'fuerte'

const NIVELES: Record<Nivel, { texto: string; barras: number; color: string }> = {
  debil: { texto: 'débil', barras: 1, color: 'bg-red-500' },
  media: { texto: 'media', barras: 2, color: 'bg-amber-500' },
  fuerte: { texto: 'fuerte', barras: 3, color: 'bg-emerald-500' },
}

/** Indicador orientativo (no es una regla: la política real la valida zod y el backend). */
function calcularNivel(password: string): Nivel {
  const variedad = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  const largo = [...password].length
  if (largo >= 16 && variedad >= 3) return 'fuerte'
  if (largo >= 12 && variedad >= 2) return 'media'
  return 'debil'
}

export default function MedidorFortaleza({ password }: { password: string }) {
  if (!password) return null
  const nivel = NIVELES[calcularNivel(password)]
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[1, 2, 3].map((barra) => (
          <span
            key={barra}
            className={clsx(
              'h-1.5 flex-1 rounded-full',
              barra <= nivel.barras ? nivel.color : 'bg-slate-200 dark:bg-slate-700',
            )}
          />
        ))}
      </div>
      <span className="text-sm text-slate-600 dark:text-slate-400">Fortaleza: {nivel.texto}</span>
    </div>
  )
}
