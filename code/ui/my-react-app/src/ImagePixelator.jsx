import { useState, useRef, useCallback, useEffect } from 'react'

/* ───────── helpers ───────── */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

/* ───────── component ───────── */

export default function ImagePixelator() {
  const [imageSrc, setImageSrc] = useState(null)
  const [fileName, setFileName] = useState('')
  const [pixelSize, setPixelSize] = useState(8)
  const [quality, setQuality] = useState(0.7)
  const [showOriginal, setShowOriginal] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [outputSize, setOutputSize] = useState(null)

  const canvasRef = useRef(null)
  const origCanvasRef = useRef(null)
  const videoRef = useRef(null)
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)

  /* load image onto hidden original canvas */
  const loadImage = useCallback((src, name) => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setImageSrc(src)
      setFileName(name || 'image')
      setShowOriginal(false)
    }
    img.src = src
  }, [])

  /* file upload */
  const handleFile = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => loadImage(ev.target.result, file.name)
      reader.readAsDataURL(file)
    },
    [loadImage]
  )

  /* camera */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      })
      setCameraStream(stream)
      setCameraActive(true)
    } catch {
      alert('Could not access camera. Please allow camera permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop())
      setCameraStream(null)
    }
    setCameraActive(false)
  }, [cameraStream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return
    const video = videoRef.current
    const c = document.createElement('canvas')
    c.width = video.videoWidth
    c.height = video.videoHeight
    c.getContext('2d').drawImage(video, 0, 0)
    loadImage(c.toDataURL('image/png'), 'camera-capture.png')
    stopCamera()
  }, [loadImage, stopCamera])

  /* attach stream to video element */
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  /* cleanup camera on unmount */
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [cameraStream])

  /* draw pixelated or original */
  useEffect(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height

    if (showOriginal) {
      ctx.drawImage(img, 0, 0)
    } else {
      // pixelate: draw small then scale up
      const sw = Math.max(1, Math.floor(img.width / pixelSize))
      const sh = Math.max(1, Math.floor(img.height / pixelSize))

      const tmp = document.createElement('canvas')
      tmp.width = sw
      tmp.height = sh
      const tctx = tmp.getContext('2d')
      tctx.imageSmoothingEnabled = false
      tctx.drawImage(img, 0, 0, sw, sh)

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(tmp, 0, 0, sw, sh, 0, 0, img.width, img.height)
    }
  }, [imageSrc, pixelSize, showOriginal])

  /* download */
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const format = quality < 1 ? 'image/jpeg' : 'image/png'
    const ext = quality < 1 ? 'jpg' : 'png'
    const dataUrl = canvas.toDataURL(format, quality)
    const base = fileName.replace(/\.[^.]+$/, '')

    // calculate approx size
    const byteStr = atob(dataUrl.split(',')[1])
    const bytes = byteStr.length
    setOutputSize(bytes)

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${base}_pixel${pixelSize}_q${Math.round(quality * 100)}.${ext}`
    a.click()
  }, [fileName, pixelSize, quality])

  const fmtSize = (bytes) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📷 Image Pixelator</h1>
        <p style={styles.subtitle}>Upload or capture a photo, then pixelate & compress it</p>

        {/* source buttons */}
        {!cameraActive && (
          <div style={styles.sourceRow}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={styles.sourceBtn}
            >
              📁 Upload Image
            </button>
            <button onClick={startCamera} style={styles.sourceBtn}>
              📸 Take Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* camera viewfinder */}
        {cameraActive && (
          <div style={styles.cameraWrap}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
            />
            <div style={styles.cameraBtnRow}>
              <button onClick={capturePhoto} style={styles.captureBtn}>
                ⏺ Capture
              </button>
              <button onClick={stopCamera} style={styles.cancelBtn}>
                ✕ Cancel
              </button>
            </div>
          </div>
        )}

        {/* image + controls */}
        {imageSrc && !cameraActive && (
          <>
            {/* canvas display */}
            <div style={styles.canvasWrap}>
              <canvas ref={canvasRef} style={styles.canvas} />
            </div>

            {/* pixel size slider */}
            <div style={styles.controlGroup}>
              <label style={styles.sliderLabel}>
                Pixel Size: <strong>{pixelSize}px</strong>
              </label>
              <input
                type="range"
                min={1}
                max={64}
                step={1}
                value={pixelSize}
                onChange={(e) => setPixelSize(parseInt(e.target.value, 10))}
                style={styles.slider}
              />
              <div style={styles.sliderTicks}>
                <span>1 (original)</span>
                <span>64 (very blocky)</span>
              </div>
            </div>

            {/* quality slider */}
            <div style={styles.controlGroup}>
              <label style={styles.sliderLabel}>
                JPEG Quality: <strong>{Math.round(quality * 100)}%</strong>
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={Math.round(quality * 100)}
                onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                style={styles.slider}
              />
              <div style={styles.sliderTicks}>
                <span>5% (tiny file)</span>
                <span>100% (PNG quality)</span>
              </div>
            </div>

            {/* action buttons */}
            <div style={styles.actionRow}>
              <button
                onClick={() => setShowOriginal((v) => !v)}
                style={{
                  ...styles.actionBtn,
                  background: showOriginal ? '#f59e0b' : '#334155',
                }}
              >
                {showOriginal ? '🔲 Show Pixelated' : '🖼 Show Original'}
              </button>
              <button onClick={handleDownload} style={{ ...styles.actionBtn, background: '#22c55e' }}>
                ⬇ Download
              </button>
            </div>

            {/* output info */}
            {outputSize && (
              <div style={styles.info}>
                Last download: ~{fmtSize(outputSize)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ───────── styles ───────── */

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#f0f4ff',
    padding: 16,
    boxSizing: 'border-box',
    overflow: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    background: 'rgba(30, 30, 50, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '1.5rem',
    fontWeight: 800,
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 18px',
    fontSize: 13,
    opacity: 0.5,
    textAlign: 'center',
  },
  sourceRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  sourceBtn: {
    padding: '12px 20px',
    borderRadius: 12,
    border: '1.5px solid #444',
    background: '#2a2a3a',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cameraWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    borderRadius: 12,
    display: 'block',
  },
  cameraBtnRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    padding: '12px 0',
  },
  captureBtn: {
    padding: '10px 24px',
    background: '#ef4444',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: '#555',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  canvasWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 16,
    lineHeight: 0,
  },
  canvas: {
    width: '100%',
    height: 'auto',
    display: 'block',
    imageRendering: 'pixelated',
  },
  controlGroup: {
    marginBottom: 16,
  },
  sliderLabel: {
    display: 'block',
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  slider: {
    width: '100%',
    accentColor: '#3b82f6',
    cursor: 'pointer',
  },
  sliderTicks: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    opacity: 0.35,
    marginTop: 2,
  },
  actionRow: {
    display: 'flex',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    padding: '12px 0',
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  info: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    opacity: 0.5,
  },
}
