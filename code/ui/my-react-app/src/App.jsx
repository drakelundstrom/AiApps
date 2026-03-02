import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import DrakeAvatar from './DrakeAvatar'
import FlappyBird from './FlappyBird'
import JapaneseGarden from './JapaneseGarden'
import ColorSudoku from './ColorSudoku'
import TipCalculator from './TipCalculator'
import ImagePixelator from './ImagePixelator'
import './App.css'

const NAV_ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/flappy-bird', label: 'Flappy Bird' },
  { to: '/japanese-garden', label: 'Japanese Garden' },
  { to: '/color-sudoku', label: 'Color Sudoku' },
  { to: '/tip-calculator', label: 'Tip Calculator' },
  { to: '/image-pixelator', label: 'Image Pixelator' },
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
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vibingwithdrake.azurestaticapps.net'

  return (
    <section className="home-page">
      <DrakeAvatar size={150} />
      <h1>Vibing with Drake</h1>
      <p className="home-tagline">AI vibe-coded apps — built with GitHub Copilot & good vibes ✨</p>

      <div className="home-bio">
        <h2>About Drake</h2>
        <p>
          Microsoft MVP in DevOps, Senior Full Stack Developer at{' '}
          <strong>Rogue Fitness</strong>, and community organizer in Columbus, OH.
          Drake co-organizes the Columbus Azure and DevOps meetups along with the
          Global Azure and Intro to DevOps conferences. When he's not solving complex
          software problems, he's mentoring, speaking, or volunteering with Rotary Youth Exchange.
        </p>
        <p className="home-links">
          <a href="https://www.linkedin.com/in/drake-lundstrom/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          {' · '}
          <a href="https://github.com/drakelundstrom" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </div>

      <div className="home-apps">
        <h2>Apps</h2>
        <p>Open the menu (☰) to explore:</p>
        <ul className="app-list">
          <li><Link to="/flappy-bird">🐦 Flappy Bird</Link></li>
          <li><Link to="/japanese-garden">🌸 Japanese Garden</Link> — 3D scene with toggleable sakura petals</li>
          <li><Link to="/color-sudoku">🎨 Color Sudoku</Link> — Sudoku with colors instead of numbers</li>
          <li><Link to="/tip-calculator">💰 Tip Calculator</Link> — Split bills with friends</li>
          <li><Link to="/image-pixelator">📷 Image Pixelator</Link> — Pixelate & compress photos</li>
          <li><Link to="/legacy/fishy">🐟 Fishy</Link> — Classic HTML/JS game</li>
        </ul>
      </div>

      <div className="home-qr">
        <h2>Share this site</h2>
        <p>Scan to open on your phone:</p>
        <QRCodeSVG
          value={siteUrl}
          size={160}
          bgColor="transparent"
          fgColor="#f0f4ff"
          level="M"
        />
        <p className="qr-url">{siteUrl}</p>
      </div>
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
        <Route path="/japanese-garden" element={<JapaneseGarden />} />
        <Route path="/color-sudoku" element={<ColorSudoku />} />
        <Route path="/tip-calculator" element={<TipCalculator />} />
        <Route path="/image-pixelator" element={<ImagePixelator />} />
        <Route
          path="/legacy/fishy"
          element={<LegacyHtmlPage src="/legacy-pages/fishy/index.html" title="Fishy Game" />}
        />
      </Route>
    </Routes>
  )
}

export default App
