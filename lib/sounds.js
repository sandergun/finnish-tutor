// lib/sounds.js - Звуковые эффекты как в Duolingo

class SoundEffects {
  constructor() {
    this.audioContext = null
    this.enabled = true
  }

  init() {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      } catch (error) {
        console.warn('AudioContext not supported:', error)
        this.enabled = false
      }
    }
  }

  // Клик по кнопке
  playClick() {
    if (!this.enabled) return
    
    try {
      this.init()
      if (!this.audioContext) return
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.1)
    } catch (error) {
      console.warn('Sound effect error:', error)
    }
  }

  // Правильный ответ
  playCorrect() {
    if (!this.enabled) return
    
    try {
      this.init()
      if (!this.audioContext) return
      
      const notes = [523.25, 659.25, 783.99] // C, E, G
      
      notes.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.frequency.value = freq
        oscillator.type = 'sine'
        
        const startTime = this.audioContext.currentTime + (index * 0.08)
        gainNode.gain.setValueAtTime(0.2, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.3)
      })
    } catch (error) {
      console.warn('Sound effect error:', error)
    }
  }

  // Неправильный ответ
  playWrong() {
    if (!this.enabled) return
    
    try {
      this.init()
      if (!this.audioContext) return
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3)
      oscillator.type = 'sawtooth'
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Sound effect error:', error)
    }
  }

  // Успешное завершение урока
  playSuccess() {
    if (!this.enabled) return
    
    try {
      this.init()
      if (!this.audioContext) return
      
      const melody = [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.1 },
        { freq: 783.99, time: 0.2 },
        { freq: 1046.50, time: 0.3 },
      ]
      
      melody.forEach(({ freq, time }) => {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.frequency.value = freq
        oscillator.type = 'sine'
        
        const startTime = this.audioContext.currentTime + time
        gainNode.gain.setValueAtTime(0.25, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.4)
      })
    } catch (error) {
      console.warn('Sound effect error:', error)
    }
  }

  // Неудачное завершение урока
  playFailure() {
    if (!this.enabled) return
    
    try {
      this.init()
      if (!this.audioContext) return
      
      const melody = [
        { freq: 392.00, time: 0 },
        { freq: 349.23, time: 0.15 },
        { freq: 293.66, time: 0.3 },
      ]
      
      melody.forEach(({ freq, time }) => {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.frequency.value = freq
        oscillator.type = 'sine'
        
        const startTime = this.audioContext.currentTime + time
        gainNode.gain.setValueAtTime(0.2, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.5)
      })
    } catch (error) {
      console.warn('Sound effect error:', error)
    }
  }

  // Переход к следующему шагу
  playNext() {
    if (!this.enabled) return
    
    try {
      this.init()
      if (!this.audioContext) return
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.value = 600
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.15)
    } catch (error) {
      console.warn('Sound effect error:', error)
    }
  }

  toggle() {
    this.enabled = !this.enabled
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }
}

export const sounds = new SoundEffects()