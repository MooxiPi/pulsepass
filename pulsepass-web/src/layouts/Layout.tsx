import { Outlet } from 'react-router'
import Footer from './Footer'
import Navbar from './Navbar'

/** Layout raíz: enlace "Saltar al contenido", Navbar, <main> y Footer (§9.2). */
export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-marca-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
