// Web Audio API Synthesized Sound Management Utility for Classroom Digital Games
// Provides Zero-Latency, Offline-Ready Sound Effects, Whistles, Fanfares, and Background Music Loops

export type BGMTheme = 
  | 'duck' 
  | 'car' 
  | 'moto' 
  | 'airplane' 
  | 'fish' 
  | 'space' 
  | 'wheel' 
  | 'quiz' 
  | 'general';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.45;

  // Background Music (BGM) loop scheduler
  private bgmIntervalId: any = null;
  private currentBgmTheme: BGMTheme | null = null;
  private bgmStepIndex: number = 0;
  private isBgmPlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Master Mute & Volume Setters
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isBgmPlaying) {
      this.stopBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  // =========================================================================
  // 1. RACE STARTING WHISTLES & COUNTDOWNS
  // =========================================================================

  /**
   * Authentic Referee Metal Starting Whistle Blow
   * Uses dual frequency modulation with rapid trill (tremolo)
   */
  public playRaceWhistle() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.7;

      // Master gain for whistle
      const masterGain = ctx.createGain();
      const effVol = this.masterVolume * this.sfxVolume * 0.35;
      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.gain.linearRampToValueAtTime(effVol, now + 0.05);
      masterGain.gain.setValueAtTime(effVol, now + duration - 0.15);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      masterGain.connect(ctx.destination);

      // Low Frequency Oscillator for whistle trill (flutter effect)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(32, now); // 32 Hz trill flutter
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(90, now); // frequency deviation
      lfo.connect(lfoGain);

      // Dual High Tone Whistle Oscillators
      const freqs = [2750, 3120]; // Authentic metal whistle dual resonance
      freqs.forEach(baseFreq => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        lfoGain.connect(osc.frequency);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq, now);
        filter.Q.setValueAtTime(5, now);

        osc.connect(filter);
        filter.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });

      lfo.start(now);
      lfo.stop(now + duration);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Countdown beep for 3, 2, 1, GO!
   */
  public playCountdownBeep(isGo: boolean = false) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freq = isGo ? 1046.5 : 587.33; // High C6 for GO, D5 for countdown
      const duration = isGo ? 0.35 : 0.15;
      const vol = this.masterVolume * this.sfxVolume * (isGo ? 0.35 : 0.2);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isGo ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      if (isGo) {
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);
      }

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // =========================================================================
  // 2. VICTORY FANFARES & CELEBRATION
  // =========================================================================

  /**
   * Grand Triumphal Victory Trumpet Fanfare
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const vol = this.masterVolume * this.sfxVolume * 0.25;

      // Brass chords: C5 -> E5 -> G5 -> C6 (Extended Grand Fanfare)
      const notes = [
        { freq: 523.25, start: 0.0, dur: 0.12 },    // C5
        { freq: 523.25, start: 0.12, dur: 0.1 },    // C5
        { freq: 523.25, start: 0.22, dur: 0.1 },    // C5
        { freq: 659.25, start: 0.34, dur: 0.22 },   // E5
        { freq: 783.99, start: 0.58, dur: 0.25 },   // G5
        { freq: 1046.50, start: 0.85, dur: 0.65 },  // C6 (Grand Sustain)
        { freq: 1318.51, start: 0.85, dur: 0.65 },  // E6 (Harmonic 3rd)
      ];

      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Rich brass-like waveform blending
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.start);

        // Add subtle vibrato on the long final chord
        if (n.dur > 0.4) {
          const vibrato = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          vibrato.frequency.setValueAtTime(6, now + n.start);
          vibratoGain.gain.setValueAtTime(6, now + n.start);
          vibrato.connect(vibratoGain);
          vibratoGain.connect(osc.frequency);
          vibrato.start(now + n.start);
          vibrato.stop(now + n.start + n.dur);
        }

        gain.gain.setValueAtTime(vol, now + n.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur);
      });

      // Crowd Cheer effect shortly after fanfare starts
      setTimeout(() => {
        this.playCrowdCheer();
      }, 500);
    } catch {}
  }

  // Alias for backward compatibility
  public playFanfare() {
    this.playVictoryFanfare();
  }

  /**
   * Synthesized Crowd Cheering & Applause Sound
   */
  public playCrowdCheer() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate pink/white noise with rhythmic fluctuations
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const envelope = Math.sin((t / 1.5) * Math.PI);
        const clapPulse = Math.sin(t * 45) > 0.3 ? 1.2 : 0.8;
        output[i] = (Math.random() * 2 - 1) * envelope * clapPulse;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const gain = ctx.createGain();
      const vol = this.masterVolume * this.sfxVolume * 0.12;
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {}
  }

  // =========================================================================
  // 3. BACKGROUND MUSIC (BGM) SYNTHESIZED LOOPS
  // =========================================================================

  /**
   * Start Theme-Specific Background Music Loop
   */
  public startBGM(theme: BGMTheme = 'general', tempoBpm: number = 130) {
    if (this.isMuted) return;
    this.stopBGM(); // Stop any existing loop

    this.currentBgmTheme = theme;
    this.isBgmPlaying = true;
    this.bgmStepIndex = 0;

    const intervalMs = (60 / tempoBpm / 2) * 1000; // 8th note interval

    this.bgmIntervalId = setInterval(() => {
      if (!this.isBgmPlaying || this.isMuted) return;
      this.tickBGMStep(theme, this.bgmStepIndex);
      this.bgmStepIndex = (this.bgmStepIndex + 1) % 16; // 16-step bar loop
    }, intervalMs);
  }

  /**
   * Stop Background Music
   */
  public stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.isBgmPlaying = false;
    this.currentBgmTheme = null;
    this.bgmStepIndex = 0;
  }

  /**
   * Synthesizes 1 musical step based on selected theme
   */
  private tickBGMStep(theme: BGMTheme, step: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const vol = this.masterVolume * this.bgmVolume * 0.12;

      // 1. DUCK RACE: Playful bubbly marimba / water pentatonic scale
      if (theme === 'duck') {
        const duckMelody = [
          523.25, 659.25, 783.99, 659.25,  // C5, E5, G5, E5
          880.00, 783.99, 659.25, 587.33,  // A5, G5, E5, D5
          523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
          880.00, 783.99, 587.33, 523.25   // A5, G5, D5, C5
        ];
        const freq = duckMelody[step];

        // Play marimba tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(vol * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);

        // Gentle sub-bass pulse on step 0, 4, 8, 12
        if (step % 4 === 0) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(130.81, now); // C3
          bassGain.gain.setValueAtTime(vol * 1.2, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + 0.2);
        }
        return;
      }

      // 2. CAR / MOTO RACE: High-Energy Techno Synth Bassline
      if (theme === 'car' || theme === 'moto') {
        const bassNotes = [
          110, 110, 146.83, 110,  // A2, A2, D3, A2
          164.81, 110, 146.83, 130.81, // E3, A2, D3, C3
          110, 110, 146.83, 110,
          196.00, 164.81, 146.83, 130.81  // G3, E3, D3, C3
        ];
        const freq = bassNotes[step];

        // Synth Bass
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);

        gain.gain.setValueAtTime(vol * 1.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);

        // Hi-hat tick on off-beats
        if (step % 2 === 1) {
          this.playHiHatTick(now, vol * 0.5);
        }
        return;
      }

      // 3. AIRPLANE RACE: Soaring airy arpeggio
      if (theme === 'airplane') {
        const skyNotes = [
          587.33, 739.99, 880.00, 1174.66,
          880.00, 739.99, 880.00, 1174.66,
          659.25, 880.00, 1046.50, 1318.51,
          1046.50, 880.00, 659.25, 587.33
        ];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(skyNotes[step], now);

        gain.gain.setValueAtTime(vol * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        return;
      }

      // 4. FISH / OCEAN RACE: Bubbly relaxing tropical melody
      if (theme === 'fish') {
        const oceanNotes = [
          440, 554.37, 659.25, 554.37,
          739.99, 659.25, 554.37, 440,
          493.88, 587.33, 739.99, 587.33,
          659.25, 587.33, 493.88, 440
        ];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(oceanNotes[step], now);
        gain.gain.setValueAtTime(vol * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        return;
      }

      // 5. SPACE / ROCKET: Futuristic synthwave
      if (theme === 'space') {
        const spaceNotes = [
          220, 329.63, 440, 659.25,
          261.63, 392.00, 523.25, 783.99,
          293.66, 440.00, 587.33, 880.00,
          329.63, 493.88, 659.25, 987.77
        ];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(spaceNotes[step], now);
        gain.gain.setValueAtTime(vol * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
        return;
      }

      // Default General / Wheel / Quiz Arcade Melody
      const arcadeNotes = [
        392.00, 523.25, 659.25, 783.99,
        659.25, 523.25, 659.25, 783.99,
        440.00, 587.33, 698.46, 880.00,
        783.99, 659.25, 587.33, 523.25
      ];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(arcadeNotes[step], now);
      gain.gain.setValueAtTime(vol * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  /**
   * Helper Hi-Hat rhythm tick
   */
  private playHiHatTick(time: number, vol: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(8000, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.03);
    } catch {}
  }

  // =========================================================================
  // 4. ACTION SOUND EFFECTS
  // =========================================================================

  /**
   * Natural Duck Quack Sound Synthesis (Soft ambient quacks, normal quacks, and loud winner quacks)
   */
  public playQuack(intensity: 'soft' | 'normal' | 'loud' | 'victory' = 'normal') {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      let volMultiplier = 0.22;
      let duration = 0.18;
      let startFreq = 340;
      let endFreq = 230;
      let filterQ = 4.5;
      let formFreq1 = 850;
      let formFreq2 = 2100;

      if (intensity === 'soft') {
        volMultiplier = 0.08; // gentle, subtle ambient quack
        duration = 0.14;
        startFreq = 300;
        endFreq = 210;
        filterQ = 3.2;
        formFreq1 = 750;
      } else if (intensity === 'loud' || intensity === 'victory') {
        volMultiplier = 0.42; // loud, joyous triumphant quack
        duration = 0.24;
        startFreq = 420;
        endFreq = 280;
        filterQ = 5.5;
        formFreq1 = 980;
        formFreq2 = 2400;
      }

      const vol = this.masterVolume * this.sfxVolume * volMultiplier;

      // Primary duck vocal formant (Sawtooth oscillator with nasal bandpass resonance)
      const osc1 = ctx.createOscillator();
      const filter1 = ctx.createBiquadFilter();
      const gain1 = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(startFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(formFreq1, now);
      filter1.Q.setValueAtTime(filterQ, now);

      gain1.gain.setValueAtTime(vol, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + duration);

      // Secondary duck beak resonance harmonic for rich natural acoustic depth
      const osc2 = ctx.createOscillator();
      const filter2 = ctx.createBiquadFilter();
      const gain2 = ctx.createGain();

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(startFreq * 1.5, now);
      osc2.frequency.exponentialRampToValueAtTime(endFreq * 1.4, now + duration);

      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(formFreq2, now);
      filter2.Q.setValueAtTime(4.0, now);

      gain2.gain.setValueAtTime(vol * 0.45, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now);
      osc2.stop(now + duration);
    } catch {}
  }

  /**
   * Loud Excited Victory Duck Celebration (Rapid joyful quacks: Quack-quack-QUACK!)
   */
  public playVictoryDuckCelebration() {
    if (this.isMuted) return;
    try {
      this.playQuack('loud');
      setTimeout(() => this.playQuack('victory'), 180);
      setTimeout(() => this.playQuack('loud'), 380);
      setTimeout(() => this.playQuack('victory'), 620);
    } catch {}
  }

  /**
   * Gentle Swimming Water Ripple & Paddle Sound
   */
  public playGentlePaddle() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const vol = this.masterVolume * this.sfxVolume * 0.07;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  // Click / Wheel Tick
  public playTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);
      
      const vol = this.masterVolume * this.sfxVolume * 0.15;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  }

  // Engine Rev / Car / Moto
  public playEngineRev(speedFactor: number = 1) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 85 * speedFactor;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.6, ctx.currentTime + 0.12);

      const vol = this.masterVolume * this.sfxVolume * 0.1;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Water Splash
  public playSplash() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.12);

      const vol = this.masterVolume * this.sfxVolume * 0.14;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Jet Whoosh
  public playWhoosh() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);

      const vol = this.masterVolume * this.sfxVolume * 0.12;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  // Correct answer chime
  public playCorrect() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [587.33, 880]; // D5, A5
      const vol = this.masterVolume * this.sfxVolume * 0.2;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(vol, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }

  // Wrong buzzer
  public playWrong() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(120, ctx.currentTime + 0.15);
      const vol = this.masterVolume * this.sfxVolume * 0.18;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }
}

export const soundManager = new SoundManager();
