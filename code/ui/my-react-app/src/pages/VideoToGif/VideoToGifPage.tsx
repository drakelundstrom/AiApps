import { useState, useRef, useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import type { ConversionStatus } from './interfaces'
import { styles } from './constants/styles'

const FFMPEG_CORE_VERSION = '0.12.10'

export default function VideoToGif() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [startTime, setStartTime] = useState(0)
  const [duration, setDuration] = useState(5)
  const [fps, setFps] = useState(10)
  const [width, setWidth] = useState(480)
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data)
      const safeBytes = new Uint8Array(bytes)
      const blob = new Blob([safeBytes], { type: 'image/gif' })

      if (gifUrl) URL.revokeObjectURL(gifUrl)
      setGifUrl(URL.createObjectURL(blob))
      setStatus('done')

      // cleanup
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile('output.gif')
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Conversion failed'
      setErrorMsg(message)
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

