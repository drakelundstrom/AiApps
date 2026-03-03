type AudioState = {
  ctx: AudioContext | null
  masterGain: GainNode | null
  drone1: OscillatorNode | null
  drone2: OscillatorNode | null
  droneGain: GainNode | null
  noiseSource: AudioBufferSourceNode | null
  noiseGain: GainNode | null
  heartbeatInterval: number | null
  unlocked: boolean
  initFailed: boolean
}

const TYPE_SAFE_AUDIO_WINDOW = window as Window & { webkitAudioContext?: typeof AudioContext }

export function createAudioState(): AudioState {
  return {
    ctx: null,
    masterGain: null,
    drone1: null,
    drone2: null,
    droneGain: null,
    noiseSource: null,
    noiseGain: null,
    heartbeatInterval: null,
    unlocked: false,
    initFailed: false,
  }
}

function initAudio(audio: AudioState): boolean {
  if (audio.ctx || audio.initFailed) return Boolean(audio.ctx)
  const AudioCtor = window.AudioContext || TYPE_SAFE_AUDIO_WINDOW.webkitAudioContext
  if (!AudioCtor) {
    audio.initFailed = true
    return false
  }

  try {
    audio.ctx = new AudioCtor()
  } catch {
    audio.initFailed = true
    return false
  }

  const ctx = audio.ctx
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0
  masterGain.connect(ctx.destination)
  audio.masterGain = masterGain

  const droneGain = ctx.createGain()
  droneGain.gain.value = 0
  droneGain.connect(masterGain)
  audio.droneGain = droneGain

  const drone1 = ctx.createOscillator()
  drone1.type = 'sawtooth'
  drone1.frequency.value = 55
  const drone1Filter = ctx.createBiquadFilter()
  drone1Filter.type = 'lowpass'
  drone1Filter.frequency.value = 220
  drone1Filter.Q.value = 7
  drone1.connect(drone1Filter).connect(droneGain)
  drone1.start()
  audio.drone1 = drone1

  const drone2 = ctx.createOscillator()
  drone2.type = 'sawtooth'
  drone2.frequency.value = 55.4
  const drone2Filter = ctx.createBiquadFilter()
  drone2Filter.type = 'lowpass'
  drone2Filter.frequency.value = 190
  drone2Filter.Q.value = 9
  drone2.connect(drone2Filter).connect(droneGain)
  drone2.start()
  audio.drone2 = drone2

  const bufferSize = ctx.sampleRate * 2
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i += 1) {
    noiseData[i] = Math.random() * 2 - 1
  }

  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = noiseBuffer
  noiseSource.loop = true
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 300
  noiseFilter.Q.value = 3
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0
  noiseSource.connect(noiseFilter).connect(noiseGain).connect(masterGain)
  noiseSource.start()
  audio.noiseSource = noiseSource
  audio.noiseGain = noiseGain

  return true
}

export async function unlockAudio(audio: AudioState): Promise<void> {
  if (audio.unlocked || audio.initFailed) return
  if (!initAudio(audio) || !audio.ctx) return

  try {
    if (audio.ctx.state === 'suspended') {
      await audio.ctx.resume()
    }
    audio.unlocked = true
  } catch {
    // Keep gameplay alive even if audio cannot resume.
  }
}

export function updateAudio(audio: AudioState, dread: number): void {
  if (!audio.ctx || !audio.masterGain || !audio.droneGain || !audio.drone1 || !audio.drone2 || !audio.noiseGain) return

  const t = audio.ctx.currentTime
  audio.masterGain.gain.setTargetAtTime(0.15 + dread * 0.5, t, 0.5)
  audio.droneGain.gain.setTargetAtTime(dread * 0.55, t, 0.4)
  audio.drone1.frequency.setTargetAtTime(55 - dread * 20, t, 1)
  audio.drone2.frequency.setTargetAtTime(55.4 - dread * 19, t, 1)
  audio.noiseGain.gain.setTargetAtTime(dread * 0.22, t, 0.5)
}

export function playEatSound(audio: AudioState, dread: number): void {
  if (!audio.ctx || !audio.masterGain) return

  const ctx = audio.ctx
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = dread < 0.4 ? 'sine' : 'square'
  osc.frequency.setValueAtTime(400 + Math.random() * 300, t)
  osc.frequency.exponentialRampToValueAtTime(dread < 0.4 ? 180 : 70, t + 0.12)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.16 + dread * 0.18, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
  osc.connect(gain).connect(audio.masterGain)
  osc.start(t)
  osc.stop(t + 0.12)
}

export function playHeartbeat(audio: AudioState, dread: number): void {
  if (!audio.ctx || dread < 0.6) return

  const ctx = audio.ctx
  const t = ctx.currentTime
  const volume = (dread - 0.6) * 1.5

  const beat = (offset: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(50, t + offset)
    osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.15)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.22 * volume, t + offset)
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.2)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t + offset)
    osc.stop(t + offset + 0.25)
  }

  beat(0)
  beat(0.18)
}

export function stopAudio(audio: AudioState): void {
  if (audio.heartbeatInterval !== null) {
    window.clearInterval(audio.heartbeatInterval)
    audio.heartbeatInterval = null
  }

  if (audio.masterGain && audio.ctx) {
    audio.masterGain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.3)
  }
}

export type { AudioState }
