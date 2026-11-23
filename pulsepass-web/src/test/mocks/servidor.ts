import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const servidor = setupServer(...handlers)

export interface PeticionRegistrada {
  metodo: string
  ruta: string
  url: string
  authorization: string | null
  cuerpo: unknown
}

/**
 * Registra las peticiones que salen hacia la API para poder afirmar, por ejemplo, que un
 * formulario inválido no dispara peticiones (QT-FE-006) o qué cabeceras se enviaron (QT-FE-007).
 */
export function registrarPeticiones(): PeticionRegistrada[] {
  const registro: PeticionRegistrada[] = []
  servidor.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    const copia = request.clone()
    const entrada: PeticionRegistrada = {
      metodo: request.method,
      ruta: url.pathname,
      url: request.url,
      authorization: request.headers.get('Authorization'),
      cuerpo: undefined,
    }
    registro.push(entrada)
    void copia
      .text()
      .then((texto) => {
        entrada.cuerpo = texto ? (JSON.parse(texto) as unknown) : undefined
      })
      .catch(() => undefined)
  })
  return registro
}
