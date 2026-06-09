/**
 * Web Audio API 音效合成器
 * 所有音效均为程序化生成，无需外部音频文件
 */

let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

/**
 * 确保 AudioContext 已恢复（需要用户交互后调用）
 */
export function resumeAudio(): void {
  const ctx = getAudioCtx()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}

/**
 * 羊皮纸摩擦声（接受任务）
 */
export function playPaperSound(): void {
  const ctx = getAudioCtx()
  const duration = 0.3

  // 白噪声源
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  // 带通滤波器模拟纸张声
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 3000
  filter.Q.value = 0.5

  // 包络
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05)
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
  source.stop(ctx.currentTime + duration)
}

/**
 * 金币掉落声（完成任务）
 */
export function playCoinSound(): void {
  const ctx = getAudioCtx()
  const now = ctx.currentTime

  // 两个短促的高频正弦波叠加
  const frequencies = [1200, 1600]
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.15)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, now + i * 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 + i * 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + i * 0.05)
    osc.stop(now + 0.25 + i * 0.05)
  })
}

/**
 * 号角声（完成任务的附加音效）
 */
export function playFanfareSound(): void {
  const ctx = getAudioCtx()
  const now = ctx.currentTime

  // 上行和弦
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now + i * 0.12)
    gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.05)
    gain.gain.setValueAtTime(0.12, now + i * 0.12 + 0.2)
    gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.45)
  })
}

/**
 * 玻璃破碎声（任务失败）
 */
export function playGlassSound(): void {
  const ctx = getAudioCtx()
  const now = ctx.currentTime

  // 高频噪声 burst
  const bufferSize = ctx.sampleRate * 0.3
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1)
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  // 高频滤波
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 4000

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
  source.stop(now + 0.3)

  // 额外的共振峰
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(6000, now)
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.2)

  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.08, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

  osc.connect(oscGain)
  oscGain.connect(ctx.destination)
  osc.start()
  osc.stop(now + 0.25)
}

/**
 * 升级钟声
 */
export function playLevelUpSound(): void {
  const ctx = getAudioCtx()
  const now = ctx.currentTime

  // 和声钟声
  const bellFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]
  bellFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.5)
  })

  // 上行琶音
  const arpNotes = [523.25, 659.25, 783.99, 1046.50]
  arpNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now + 0.8 + i * 0.1)
    gain.gain.linearRampToValueAtTime(0.1, now + 0.8 + i * 0.1 + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.1 + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + 0.8 + i * 0.1)
    osc.stop(now + 0.8 + i * 0.1 + 0.35)
  })
}

/**
 * 按钮点击声
 */
export function playClickSound(): void {
  const ctx = getAudioCtx()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = 800

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(now + 0.06)
}
