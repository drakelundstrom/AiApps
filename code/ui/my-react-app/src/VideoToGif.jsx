import { useState, useRef, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'

const FFMPEG_CORE_VERSION = '0.12.10'

export default function VideoToGif() {
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [gifUrl, setGifUrl] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | loading | converting | done | error
  const [errorMsg, setErrorMsg] = useState('')
  const [startTime, setStartTime] = useState(0)
  const [duration, setDuration] = useState(5)
  const [fps, setFps] = useState(10)
  const [width, setWidth] = useState(480)
  const ffmpegRef = useRef(null)
  const inputRef = useRef(null)

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current

    const ffmpeg = new FFmpeg()
    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(Math.min(p, 1) * 100))
    })

    const baseURL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpegRef.current = ffmpeg
    return ffmpeg
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl)
      setGifUrl(null)
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
  }

  const handleConvert = async () => {
    if (!videoFile) return
    try {
      setStatus('loading')
      setProgress(0)
      setErrorMsg('')

      const ffmpeg = await loadFFmpeg()

      setStatus('converting')
      const inputName = 'input' + (videoFile.name.substring(videoFile.name.lastIndexOf('.')) || '.mp4')
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

      await ffmpeg.exec([
        '-ss', String(startTime),
        '-t', String(duration),
        '-i', inputName,
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif',
      ])

      const data = await ffmpeg.readFile('output.gif')
      const blob = new Blob([data.buffer], { type: 'image/gif' })

      if (gifUrl) URL.revokeObjectURL(gifUrl)
      setGifUrl(URL.createObjectURL(blob))
      setStatus('done')

      // cleanup
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile('output.gif')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Conversion failed')
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!gifUrl) return
    const a = document.createElement('a')
    a.href = gifUrl
    a.download = 'converted.gif'
    a.click()
  }

  const handleReset = () => {
    if (gifUrl) URL.revokeObjectURL(gifUrl)
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoFile(null)
    setVideoUrl(null)
    setGifUrl(null)
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎬 Video → GIF Converter</h1>
      <p style={styles.subtitle}>
        Convert any video to an animated GIF — entirely in your browser using FFmpeg WebAssembly.
        No uploads, no servers.
      </p>

      {/* File picker */}
      <div style={styles.uploadArea}>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={styles.fileInput}
          id="video-file-input"
        />
        <label htmlFor="video-file-input" style={styles.uploadLabel}>
          {videoFile ? `📁 ${videoFile.name}` : '📂 Choose a video file'}
        </label>
      </div>

      {/* Video preview */}
      {videoUrl && (
        <video src={videoUrl} controls style={styles.videoPreview} />
      )}

      {/* Settings */}
      {videoFile && (
        <div style={styles.settings}>
          <h3 style={styles.settingsTitle}>Settings</h3>
          <div style={styles.settingsGrid}>
            <label style={styles.label}>
              Start (sec)
              <input
                type="number"
                min={0}
                step={0.5}
                value={startTime}
                onChange={(e) => setStartTime(Math.max(0, +e.target.value))}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Duration (sec)
              <input
                type="number"
                min={0.5}
                max={30}
                step={0.5}
                value={duration}
                onChange={(e) => setDuration(Math.max(0.5, Math.min(30, +e.target.value)))}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              FPS
              <input
                type="number"
                min={1}
                max={30}
                value={fps}
                onChange={(e) => setFps(Math.max(1, Math.min(30, +e.target.value)))}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Width (px)
              <input
                type="number"
                min={100}
                max={1920}
                step={10}
                value={width}
                onChange={(e) => setWidth(Math.max(100, Math.min(1920, +e.target.value)))}
                style={styles.input}
              />
            </label>
          </div>

          <button
            onClick={handleConvert}
            disabled={status === 'loading' || status === 'converting'}
            style={{
              ...styles.convertBtn,
              opacity: status === 'loading' || status === 'converting' ? 0.6 : 1,
            }}
          >
            {status === 'loading'
              ? '⏳ Loading FFmpeg…'
              : status === 'converting'
                ? `⚙️ Converting… ${progress}%`
                : '🚀 Convert to GIF'}
          </button>

          {(status === 'loading' || status === 'converting') && (
            <div style={styles.progressBarOuter}>
              <div
                style={{
                  ...styles.progressBarInner,
                  width: status === 'loading' ? '100%' : `${progress}%`,
                  animation: status === 'loading' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <p style={styles.error}>❌ {errorMsg}</p>
      )}

      {/* GIF result */}
      {gifUrl && (
        <div style={styles.result}>
          <h3 style={styles.resultTitle}>Your GIF</h3>
          <img src={gifUrl} alt="Converted GIF" style={styles.gifPreview} />
          <div style={styles.resultActions}>
            <button onClick={handleDownload} style={styles.downloadBtn}>
              ⬇️ Download GIF
            </button>
            <button onClick={handleReset} style={styles.resetBtn}>
              🔄 Start Over
            </button>
          </div>
        </div>
      )}

      {/* Inline keyframes for the loading pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 700,
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#f0f4ff',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },
  uploadArea: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
  },
  videoPreview: {
    width: '100%',
    maxHeight: 360,
    borderRadius: 12,
    marginBottom: '1.5rem',
    background: '#000',
  },
  settings: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  settingsTitle: {
    margin: '0 0 1rem',
    fontSize: '1.1rem',
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: '0.85rem',
    color: '#cbd5e1',
  },
  input: {
    padding: '0.5rem',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.3)',
    color: '#f0f4ff',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  convertBtn: {
    display: 'block',
    width: '100%',
    padding: '0.85rem',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    fontSize: '1.05rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
  },
  progressBarOuter: {
    marginTop: '0.75rem',
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 4,
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    transition: 'width 0.3s ease',
  },
  error: {
    color: '#f87171',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  result: {
    textAlign: 'center',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '1.5rem',
  },
  resultTitle: {
    marginTop: 0,
    marginBottom: '1rem',
  },
  gifPreview: {
    maxWidth: '100%',
    borderRadius: 12,
    marginBottom: '1rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  resultActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  downloadBtn: {
    padding: '0.7rem 1.5rem',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '0.7rem 1.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 10,
    background: 'transparent',
    color: '#cbd5e1',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
