import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameEngine } from './components/GameEngine'
import { GameUI } from './components/GameUI'
import { GameStats } from './interfaces'

const INITIAL_STATS: GameStats = {
  score: 0,
  health: 100,
  energy: 100,
  timeElapsed: 0,
  objectsInteracted: 0,
}

export default function GoatSimulatorPage() {
  const [isPaused, setIsPaused] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>(INITIAL_STATS)
  const [gameKey, setGameKey] = useState(0)

  const handlePauseToggle = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setGameStats(INITIAL_STATS)
    setGameKey((prev) => prev + 1)
    setIsPaused(false)
  }, [])

  const handleStatsUpdate = useCallback((stats: GameStats) => {
    setGameStats(stats)
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === 'P') {
        handlePauseToggle()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePauseToggle])

  return (
    <div className="goat-simulator-page">
      <div className="canvas-container">
        <Canvas
          key={gameKey}
          camera={{ position: [10, 8, 10], fov: 75 }}
          shadows
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[50, 50, 50]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={200}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
          <fog attach="fog" args={['#87ceeb', 50, 300]} />

          <GameEngine key={gameKey} isPaused={isPaused} onStatsUpdate={handleStatsUpdate} />
        </Canvas>
      </div>

      <GameUI
        stats={gameStats}
        isPaused={isPaused}
        onPauseToggle={handlePauseToggle}
        onReset={handleReset}
      />

      <style>{`
        .goat-simulator-page {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #2d2d2d;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .canvas-container {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .game-ui {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .game-hud {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          padding: 20px;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          font-weight: bold;
          pointer-events: auto;
          border: 2px solid #4CAF50;
          min-width: 250px;
        }

        .stat-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 15px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .stat-label {
          min-width: 60px;
        }

        .stat-value {
          font-size: 18px;
          color: #4CAF50;
        }

        .health-bar,
        .energy-bar {
          width: 120px;
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #666;
        }

        .health-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff4444, #ffaa00);
          transition: width 0.2s ease;
        }

        .energy-fill {
          height: 100%;
          background: linear-gradient(90deg, #44ff44, #00ff88);
          transition: width 0.2s ease;
        }

        .controls-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          border-top: 1px solid #666;
          padding-top: 10px;
          margin-top: 10px;
        }

        .control {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .control kbd {
          background: #333;
          border: 1px solid #666;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 11px;
        }

        .control span {
          color: #aaa;
        }

        .game-buttons {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          pointer-events: auto;
        }

        .game-btn {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .pause-btn {
          background: #2196F3;
        }

        .pause-btn:hover {
          background: #1976D2;
          transform: scale(1.05);
        }

        .reset-btn {
          background: #FF6B6B;
        }

        .reset-btn:hover {
          background: #FF5252;
          transform: scale(1.05);
        }

        .pause-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }

        .pause-message {
          background: rgba(0, 0, 0, 0.95);
          padding: 40px;
          border-radius: 15px;
          text-align: center;
          color: white;
          border: 3px solid #4CAF50;
        }

        .pause-message h2 {
          font-size: 36px;
          margin: 0 0 10px 0;
          color: #4CAF50;
        }

        .pause-message p {
          font-size: 18px;
          margin: 0;
          color: #aaa;
        }

        @media (max-width: 768px) {
          .game-hud {
            top: 10px;
            left: 10px;
            padding: 15px;
            font-size: 14px;
            min-width: 200px;
          }

          .game-buttons {
            bottom: 10px;
            right: 10px;
            flex-direction: column;
          }

          .game-btn {
            padding: 10px 16px;
            font-size: 14px;
          }

          .controls-info {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
