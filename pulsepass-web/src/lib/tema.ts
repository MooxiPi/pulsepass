/** Preferencia de tema claro/oscuro (FR-FE-GEN-004). No guarda datos sensibles. */
export type Tema = 'claro' | 'oscuro'

const CLAVE = 'pulsepass.tema'

export function temaActual(): Tema {
  return document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.classList.toggle('dark', tema === 'oscuro')
  try {
    // Solo la preferencia visual vive en localStorage; el token usa sessionStorage (PRD §12.2).
    window.localStorage.setItem(CLAVE, tema)
  } catch {
    // Almacenamiento no disponible: el tema solo dura la sesión actual.
  }
}
