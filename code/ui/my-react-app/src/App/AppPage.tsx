import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import FlappyBird from '../pages/FlappyBird/FlappyBirdPage'
import JapaneseGarden from '../pages/JapaneseGarden/JapaneseGardenPage'
import ColorSudoku from '../pages/ColorSudoku/ColorSudokuPage'
import TipCalculator from '../pages/TipCalculator/TipCalculatorPage'
import ImagePixelator from '../pages/ImagePixelator/ImagePixelatorPage'
import DCDeckBuilder from '../pages/DCDeckBuilder/DCDeckBuilderPage'
import DeckBuilderTierList from '../pages/DeckBuilderTierList/DeckBuilderTierListPage'
import VideoToGif from '../pages/VideoToGif/VideoToGifPage'
import BalloonPop from '../pages/BalloonPop/BalloonPopPage'
import Fishy from '../pages/Fishy/FishyPage'
import IndieAnimatedShows from '../pages/IndieAnimatedShows/IndieAnimatedShowsPage'
import './App.css'

const NAV_ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/flappy-bird', label: 'Flappy Bird' },
  { to: '/japanese-garden', label: 'Japanese Garden' },
  { to: '/color-sudoku', label: 'Color Sudoku' },
  { to: '/tip-calculator', label: 'Tip Calculator' },
  { to: '/image-pixelator', label: 'Image Pixelator' },
  { to: '/dc-deck-builder', label: 'DC Deck Builder' },
  { to: '/deck-builder-tier-list', label: 'Deck Builder Tier List' },
  { to: '/video-to-gif', label: 'Video → GIF' },
  { to: '/balloon-pop', label: 'Balloon Pop' },
  { to: '/fishy', label: 'Fishy' },
  { to: '/indie-animated-shows', label: 'Indie Animated Shows' },
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
      <h1>Vibing with Drake</h1>
      <p className="home-tagline">AI vibe-coded apps — built with GitHub Copilot & good vibes ✨</p>

      <div className="home-bio">
        <h2>About Drake</h2>
        <p>
          Microsoft MVP in DevOps, Senior Full Stack Developer at{' '}
          <strong>Rogue Fitness</strong>, and community organizer in Columbus, OH.
          Drake co-organizes the Columbus Azure and DevOps meetups along with the
          Global Azure and Intro to DevOps conferences. When he&apos;s not solving complex
          software problems, he&apos;s mentoring, speaking, or volunteering with Rotary Youth Exchange.
        </p>
        <p className="home-links">
          <a href="https://www.linkedin.com/in/drake-lundstrom/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          {' • '}
          <a href="https://github.com/drakelundstrom" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </div>

      <div className="home-apps">
        <h2>Apps</h2>
        <p>Open the menu (☰) to explore:</p>
        <ul className="app-list">
          <li><Link to="/flappy-bird">🐦 Flappy Bird</Link> — Tap to flap through pipes and beat your high score</li>
          <li><Link to="/japanese-garden">🌸 Japanese Garden</Link> — 3D scene with toggleable sakura petals</li>
          <li><Link to="/color-sudoku">🎨 Color Sudoku</Link> — Sudoku with colors instead of numbers</li>
          <li><Link to="/tip-calculator">💰 Tip Calculator</Link> — Split bills with friends</li>
          <li><Link to="/image-pixelator">📷 Image Pixelator</Link> — Pixelate & compress photos</li>
          <li><Link to="/dc-deck-builder">🃏 DC Deck Builder</Link> — Victory Point tracker for DC DBG</li>
          <li><Link to="/deck-builder-tier-list">🏆 Deck Builder Tier List</Link> — Rank the best deck-building games</li>
          <li><Link to="/video-to-gif">🎬 Video → GIF</Link> — Convert video to GIF in-browser with WASM</li>
          <li><Link to="/balloon-pop">🎈 Balloon Pop</Link> — Distract cats, dogs & babies with popping balloons</li>
          <li><Link to="/fishy">🐟 Fishy</Link> — Creepy ocean survival game</li>
          <li><Link to="/indie-animated-shows">🎞️ Indie Animated Shows</Link> — Curated indie animation studios & shows</li>
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
        <Route path="/dc-deck-builder" element={<DCDeckBuilder />} />
        <Route path="/deck-builder-tier-list" element={<DeckBuilderTierList />} />
        <Route path="/video-to-gif" element={<VideoToGif />} />
        <Route path="/balloon-pop" element={<BalloonPop />} />
        <Route path="/fishy" element={<Fishy />} />
        <Route path="/indie-animated-shows" element={<IndieAnimatedShows />} />
        <Route path="/legacy/fishy" element={<Navigate to="/fishy" replace />} />
      </Route>
    </Routes>
  )
}

export default App

