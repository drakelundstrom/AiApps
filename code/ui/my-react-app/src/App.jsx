import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import FlappyBird from './FlappyBird'
import './App.css'

const NAV_ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/flappy-bird', label: 'Flappy Bird' },
  { to: '/legacy/fishy', label: 'Fishy (HTML/JS)' },
]

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app-shell">
      <button
        type="button"
        className={`hamburger-button ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`menu-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav className={`side-menu ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
        <p className="menu-title">Pages</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}

function HomePage() {
  return (
    <section className="home-page">
      <h1>Mini Game Hub</h1>
      <p>Select a page from the hamburger menu.</p>
      <p>
        Legacy pages can be added under <code>public/legacy-pages</code> and routed in React.
      </p>
      <Link className="cta-link" to="/legacy/fishy">
        Open Fishy Sample
      </Link>
    </section>
  )
}

function LegacyHtmlPage({ src, title }) {
  return (
    <div className="legacy-page-frame">
      <iframe src={src} title={title} className="legacy-iframe" />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/flappy-bird" element={<FlappyBird />} />
        <Route
          path="/legacy/fishy"
          element={<LegacyHtmlPage src="/legacy-pages/fishy/index.html" title="Fishy Game" />}
        />
      </Route>
    </Routes>
  )
}

export default App
