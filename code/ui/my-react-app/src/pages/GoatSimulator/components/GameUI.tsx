import { GameStats } from '../interfaces'

interface GameUIProps {
  stats: GameStats
  isPaused: boolean
  onPauseToggle: () => void
  onReset: () => void
}

export function GameUI({ stats, isPaused, onPauseToggle, onReset }: GameUIProps) {
  const timeDisplay = Math.floor(stats.timeElapsed / 1000)
  const minutes = Math.floor(timeDisplay / 60)
  const seconds = timeDisplay % 60

  return (
    <div className="game-ui">
      <div className="game-hud">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value">{stats.score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Health</span>
            <div className="health-bar">
              <div
                className="health-fill"
                style={{ width: `${(stats.health / 100) * 100}%` }}
              />
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Energy</span>
            <div className="energy-bar">
              <div
                className="energy-fill"
                style={{ width: `${(stats.energy / 100) * 100}%` }}
              />
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time</span>
            <span className="stat-value">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</span>
          </div>
        </div>

        <div className="controls-info">
          <div className="control">
            <kbd>W/A/S/D</kbd> <span>Move</span>
          </div>
          <div className="control">
            <kbd>SPACE</kbd> <span>Jump</span>
          </div>
          <div className="control">
            <kbd>Left Click</kbd> <span>Headbutt</span>
          </div>
          <div className="control">
            <kbd>P</kbd> <span>Pause</span>
          </div>
        </div>
      </div>

      <div className="game-buttons">
        <button
          className="game-btn pause-btn"
          onClick={onPauseToggle}
          type="button"
        >
          {isPaused ? 'Resume' : 'Pause'} (P)
        </button>
        <button
          className="game-btn reset-btn"
          onClick={onReset}
          type="button"
        >
          New Game
        </button>
      </div>

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-message">
            <h2>Game Paused</h2>
            <p>Press P or click Resume to continue</p>
          </div>
        </div>
      )}
    </div>
  )
}
