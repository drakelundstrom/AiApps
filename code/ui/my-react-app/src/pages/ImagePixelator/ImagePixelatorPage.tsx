import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { styles } from './constants/styles'

/* ───────── component ───────── */

export default function ImagePixelator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [pixelSize, setPixelSize] = useState(8)
  const [quality, setQuality] = useState(0.7)
  const [showOriginal, setShowOriginal] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [outputSize, setOutputSize] = useState<number | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  /* load image onto hidden original canvas */
  const loadImage = useCallback((src: string, name?: string) => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setImageSrc(src)
      setFileName(name ?? 'image')
      setShowOriginal(false)
    }
    img.src = src
  }, [])

  /* file upload */
  const handleFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result
        if (typeof result === 'string') {
          loadImage(result, file.name)
        }
      }
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
      cameraStream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
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
    const context = c.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0)
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
        cameraStream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
      }
    }
  }, [cameraStream])

  /* draw pixelated or original */
  useEffect(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
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
      if (!tctx) return
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

  const fmtSize = (bytes: number): string => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  return (
    <div className="page-container" style={styles.container}>
      <div className="glass-card" style={styles.card}>
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
