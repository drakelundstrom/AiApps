export function createAudioContext(): AudioContext {
  return new (window.AudioContext || window.webkitAudioContext)()
}

export function playPop(ctx: AudioContext): void {
  const now = ctx.currentTime
  const bufferSize = Math.floor(ctx.sampleRate * 0.08)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 800 + Math.random() * 1200
  filter.Q.value = 1.5

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.6, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
  noise.connect(filter).connect(gain).connect(ctx.destination)
  noise.start(now)
  noise.stop(now + 0.08)

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600 + Math.random() * 800, now)
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.15)
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.3, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  osc.connect(oscGain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.15)
}

export function startMusic(ctx: AudioContext): () => void {
  const melodyNotes = [
    60, 64, 67, 72, 76, 72, 67, 64,
    62, 65, 69, 74, 77, 74, 69, 65,
    60, 64, 67, 71, 72, 71, 67, 64,
  ]
  const midiToHz = (midiNote: number): number => 440 * Math.pow(2, (midiNote - 69) / 12)
  const noteDuration = 0.3
  const loopLen = melodyNotes.length * noteDuration

  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.12
  masterGain.connect(ctx.destination)

  let stopped = false

  const scheduleLoop = (startTime: number): void => {
    if (stopped) return

    melodyNotes.forEach((note, index) => {
      if (stopped) return
      const t = startTime + index * noteDuration

      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = midiToHz(note)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.5, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 0.9)
      osc.connect(gain).connect(masterGain)
      osc.start(t)
      osc.stop(t + noteDuration)

      if (index % 8 === 0) {
        const bass = ctx.createOscillator()
        bass.type = 'sine'
        bass.frequency.value = midiToHz(note - 24)
        const bassGain = ctx.createGain()
        bassGain.gain.setValueAtTime(0.6, t)
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 7.5)
        bass.connect(bassGain).connect(masterGain)
        bass.start(t)
        bass.stop(t + noteDuration * 8)
      }
    })

    window.setTimeout(() => scheduleLoop(startTime + loopLen), (loopLen - 1) * 1000)
  }

  scheduleLoop(ctx.currentTime + 0.1)
  return () => {
    stopped = true
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
  }
}
