export type SoundType =
  | 'MESSAGE_SENT'
  | 'MESSAGE_RECEIVED'
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'CRITICAL_ALERT'
  | 'AI_READY'
  | 'MODE_SWITCH'
  | 'BUTTON_CLICK';

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.25;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('copper_sound_muted');
      this.isMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('copper_sound_volume');
      if (savedVol) {
        this.volume = parseFloat(savedVol);
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('copper_sound_muted', muted.toString());
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('copper_sound_volume', this.volume.toString());
    }
  }

  public play(type: SoundType) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(ctx.destination);

      switch (type) {
        case 'MESSAGE_SENT': {
          // Soft swoosh / pop: 580Hz -> 880Hz em 80ms
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(580, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }

        case 'MESSAGE_RECEIVED': {
          // Chime duplo elegante: 659.25Hz (E5) seguido de 880Hz (A5)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(659.25, now);
          gain1.gain.setValueAtTime(0.35, now);
          gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc1.connect(gain1);
          gain1.connect(masterGain);
          osc1.start(now);
          osc1.stop(now + 0.13);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, now + 0.07);
          gain2.gain.setValueAtTime(0.4, now + 0.07);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc2.connect(gain2);
          gain2.connect(masterGain);
          osc2.start(now + 0.07);
          osc2.stop(now + 0.23);
          break;
        }

        case 'TASK_CREATED': {
          // Acorde tríade suave ascendente (C5 -> E5 -> G5)
          const notes = [523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.05;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.16);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.17);
          });
          break;
        }

        case 'TASK_COMPLETED': {
          // Checkmark de sucesso cristalino (880Hz -> 1320Hz com decaimento rico)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(880, now);
          osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
          osc2.frequency.setValueAtTime(1320, now + 0.08);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);

          osc1.start(now);
          osc2.start(now + 0.08);
          osc1.stop(now + 0.36);
          osc2.stop(now + 0.36);
          break;
        }

        case 'CRITICAL_ALERT': {
          // Pulso duplo de atenção executiva (440Hz -> 370Hz discreto)
          [0, 0.14].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + delay;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, startTime);
            osc.frequency.exponentialRampToValueAtTime(370, startTime + 0.09);
            gain.gain.setValueAtTime(0.45, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.11);
          });
          break;
        }

        case 'AI_READY': {
          // Sparkle chime tecnológico (1046.5Hz com harmônico superior 1567.98Hz)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(1046.5, now);
          osc2.frequency.setValueAtTime(1567.98, now + 0.04);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);

          osc1.start(now);
          osc2.start(now + 0.04);
          osc1.stop(now + 0.29);
          osc2.stop(now + 0.29);
          break;
        }

        case 'MODE_SWITCH': {
          // Clique eletromecânico vintage Bloomberg CRT
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'BUTTON_CLICK': {
          // Clique suave de botão
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.025);
          break;
        }
      }
    } catch (e) {
      console.warn('Audio feedback failed silently:', e);
    }
  }
}

export const soundService = new SoundService();
