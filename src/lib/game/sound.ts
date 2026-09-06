// Web Audio API Complete Dynamic Sound & Music Engine for DOUR Party Game
// Includes dynamic sound variation, non-repetitive chimes, organic clock ticks, and ambient background music

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  
  // Background music state
  private currentBgmMode: 'none' | 'menu' | 'game' = 'none';
  private bgmTimeout: number | null = null;
  private bgmStep: number = 0;

  // Tracking last played variant to ensure consecutive sounds are never identical
  private lastCorrectVariant: number = -1;
  private lastSwapVariant: number = -1;
  private tickToggle: boolean = false;
  private noiseBuf: AudioBuffer | null = null;
  private gameSecondsLeft = 60;
  private bus: GainNode | null = null;
  private resumeMode: "none" | "menu" | "game" = "none";

  constructor() {
    this.initAutoUnlock();
    this.primeVoices();
  }

  private initAutoUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.getAudioContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (!this.isMuted && this.currentBgmMode === 'none') {
        this.startMenuBGM();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  public getAudioContext(): AudioContext | null {
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

  private dest(): AudioNode | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    if (!this.bus || this.bus.context !== ctx) {
      this.bus = ctx.createGain();
      this.bus.gain.value = 0.9;
      this.bus.connect(ctx.destination);
    }
    return this.bus;
  }

  private noise(): AudioBuffer | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    if (this.noiseBuf) return this.noiseBuf;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    return buf;
  }

  private kick(t: number, vol = 0.28) {
    const ctx = this.getAudioContext();
    const out = this.dest();
    if (!ctx || !out) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.11);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  private snare(t: number, vol = 0.14) {
    const ctx = this.getAudioContext();
    const buf = this.noise();
    const out = this.dest();
    if (!ctx || !buf || !out) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(hp);
    hp.connect(g);
    g.connect(out);
    src.start(t);
    src.stop(t + 0.14);
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, t);
    og.gain.setValueAtTime(vol * 0.5, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(og);
    og.connect(out);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  private hat(t: number, open = false, vol = 0.045) {
    const ctx = this.getAudioContext();
    const buf = this.noise();
    const out = this.dest();
    if (!ctx || !buf || !out) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = open ? 6000 : 8000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.14 : 0.035));
    src.connect(hp);
    hp.connect(g);
    g.connect(out);
    src.start(t);
    src.stop(t + 0.16);
  }

  private tone(
    t: number,
    freq: number,
    dur: number,
    vol: number,
    type: OscillatorType = "triangle",
  ) {
    const ctx = this.getAudioContext();
    const out = this.dest();
    if (!ctx || !out || !freq) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.resumeMode = this.currentBgmMode === "none" ? this.resumeMode : this.currentBgmMode;
      this.stopSpeech();
      this.stopBGM();
    } else if (this.resumeMode === "game") {
      this.startGameplayBGM(this.gameSecondsLeft);
    } else {
      this.startMenuBGM();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.setMuted(!enabled);
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public stopMenuBGM() {
    if (this.currentBgmMode === 'menu') {
      this.stopBGM();
    }
  }

  public playWinner() {
    this.playVictory();
  }

  public playCountdownBeep(secondsRemaining: number) {
    this.playUrgentTick(secondsRemaining);
  }

  public playBuzzer() {
    this.playElimination();
  }

  public playPowerUp() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        gain.gain.setValueAtTime(0.18, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.15);
      });
    } catch (e) {}
  }

  // --- DYNAMIC NON-REPETITIVE SOUND EFFECTS ---

  // 1. UI Click with subtle random micro-pitch variation (tactile, organic click)
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Slight pitch variation +/- 8% to avoid robotic repetition
      const baseFreq = 540 + (Math.random() * 80 - 40);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.035);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 2. Toggle / Tab switch / Select with harmonic variation
  public playToggle() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // 3 variations of cheerful toggle intervals
      const pairs = [
        [587.33, 880.00], // D5 -> A5
        [659.25, 987.77], // E5 -> B5
        [523.25, 783.99], // C5 -> G5
      ];
      const selected = pairs[Math.floor(Math.random() * pairs.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(selected[0], now);
      osc.frequency.setValueAtTime(selected[1], now + 0.03);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch (e) {}
  }

  // 3. Start Game Fanfare
  public playStartGame() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.20, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.22);
      });
    } catch (e) {}
  }

  // 4. Correct Guess Chime - 6 distinct melodic variations to avoid repetitive fatigue!
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // 6 distinct pleasant ascending melodic patterns
      const chimeVariants: Array<Array<{ f: number; d: number }>> = [
        // Variant 0: High Major Arpeggio (C5-E5-G5-C6)
        [
          { f: 523.25, d: 0.04 },
          { f: 659.25, d: 0.04 },
          { f: 783.99, d: 0.04 },
          { f: 1046.50, d: 0.16 }
        ],
        // Variant 1: Pentatonic Sparkle (F5-A5-C6-E6)
        [
          { f: 698.46, d: 0.035 },
          { f: 880.00, d: 0.035 },
          { f: 1046.50, d: 0.04 },
          { f: 1318.51, d: 0.18 }
        ],
        // Variant 2: Warm Kalimba Triad (G4-D5-G5-B5)
        [
          { f: 392.00, d: 0.04 },
          { f: 587.33, d: 0.04 },
          { f: 783.99, d: 0.05 },
          { f: 987.77, d: 0.16 }
        ],
        // Variant 3: Double Bounce Chord (E5-G5-A5-D6)
        [
          { f: 659.25, d: 0.03 },
          { f: 783.99, d: 0.03 },
          { f: 880.00, d: 0.04 },
          { f: 1174.66, d: 0.18 }
        ],
        // Variant 4: Glissando Cascade (D5-F#5-A5-C#6)
        [
          { f: 587.33, d: 0.035 },
          { f: 739.99, d: 0.035 },
          { f: 880.00, d: 0.04 },
          { f: 1108.73, d: 0.17 }
        ],
        // Variant 5: Golden Fanfare (A4-C#5-E5-A5-E6)
        [
          { f: 440.00, d: 0.03 },
          { f: 554.37, d: 0.03 },
          { f: 659.25, d: 0.03 },
          { f: 880.00, d: 0.05 },
          { f: 1318.51, d: 0.18 }
        ]
      ];

      // Pick a different variant than the immediately preceding one
      let chosenIdx = Math.floor(Math.random() * chimeVariants.length);
      if (chosenIdx === this.lastCorrectVariant) {
        chosenIdx = (chosenIdx + 1) % chimeVariants.length;
      }
      this.lastCorrectVariant = chosenIdx;

      const pattern = chimeVariants[chosenIdx];
      let offset = 0;

      pattern.forEach(({ f, d }, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Pleasant bell-like mix (triangle + soft harmonics)
        osc.type = idx === pattern.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now + offset);

        const volume = idx === pattern.length - 1 ? 0.24 : 0.16;
        gain.gain.setValueAtTime(volume, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + d + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + d + 0.12);

        offset += d;
      });
    } catch (e) {}
  }

  // 5. Swap / Pass Sound - with 3 distinct swoosh variations
  public playSwap() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      let variant = Math.floor(Math.random() * 3);
      if (variant === this.lastSwapVariant) {
        variant = (variant + 1) % 3;
      }
      this.lastSwapVariant = variant;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (variant === 0) {
        // Deep airy filter whoosh
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.13);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.13);
      } else if (variant === 1) {
        // Quick slide swoop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      } else {
        // Crisp card snap flip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.11);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.11);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  // 6. Natural Organic Mechanical Tick-Tock (Alternating soft woodblock tone, non-grating!)
  public playTick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.tickToggle = !this.tickToggle;

      // Alternating "Tick" (higher wood) and "Tock" (lower wood)
      const freq = this.tickToggle ? 920 : 640;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.02);

      // Very subtle, quiet volume so it doesn't fatigue players during a 90s round
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  // 7. Final 5 Seconds Urgent Dramatic Siren/Alarm (Exciting building pitch, non-piercing)
  public playUrgentTick(secondsRemaining: number) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Ascending pitch base as countdown reaches 1
      const stepIndex = Math.max(1, Math.min(5, secondsRemaining));
      const pitchOffset = (6 - stepIndex) * 90; // 900Hz -> 1260Hz

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      const freq1 = 800 + pitchOffset;
      const freq2 = freq1 * 1.5; // Perfect 5th overtone for musical tension

      osc1.frequency.setValueAtTime(freq1, now);
      osc1.frequency.exponentialRampToValueAtTime(freq1 * 1.2, now + 0.08);

      osc2.frequency.setValueAtTime(freq2, now);
      osc2.frequency.exponentialRampToValueAtTime(freq2 * 1.2, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.09);
      osc2.stop(now + 0.09);
    } catch (e) {}
  }

  // 8. Elimination / Team Defeat Sound
  public playElimination() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [311.13, 293.66, 261.63, 220.0, 164.81]; // Descending minor tones
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.11);

        gain.gain.setValueAtTime(0.18, now + i * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.19);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.11);
        osc.stop(now + i * 0.11 + 0.19);
      });
    } catch (e) {}
  }

  // 9. Round Ended Resonant Gong
  public playRoundEnd() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.7);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.7);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.7);
      subOsc.stop(now + 0.7);
    } catch (e) {}
  }

  // 10. Victory Fanfare (Rich celebratory progression)
  public playVictory() {
    if (this.isMuted) return;
    this.stopBGM();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.11 }, // C5
        { f: 659.25, d: 0.11 }, // E5
        { f: 783.99, d: 0.11 }, // G5
        { f: 1046.50, d: 0.28 }, // C6
        { f: 880.00, d: 0.14 }, // A5
        { f: 1046.50, d: 0.14 }, // C6
        { f: 1318.51, d: 0.45 }, // E6
      ];

      let t = now;
      melody.forEach(({ f, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + d);
        t += d * 0.92;
      });
    } catch (e) {}
  }

  // --- PARTY BGM: four-on-the-floor, hook, tension ramp ---

  public startMenuBGM() {
    if (this.isMuted) return;
    if (this.currentBgmMode === "menu") return;
    this.stopBGM();
    this.currentBgmMode = "menu";
    this.bgmStep = 0;
    this.scheduleNextMenuBeat();
  }

  private scheduleNextMenuBeat() {
    if (this.currentBgmMode !== "menu" || this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const stepMs = 128;
    const step = this.bgmStep % 32;
    const now = ctx.currentTime;

    try {
      if (step % 4 === 0) this.kick(now, 0.26);
      if (step % 16 === 10) this.kick(now, 0.14);
      if (step % 8 === 4) this.snare(now, 0.13);
      if (step % 2 === 0) this.hat(now, false, 0.04);
      if (step % 8 === 6) this.hat(now, true, 0.05);

      const bassLoop = [
        98.0, null, 98.0, 146.83, 130.81, null, 130.81, 196.0,
        110.0, null, 110.0, 164.81, 146.83, null, 98.0, 123.47,
        87.31, null, 87.31, 130.81, 116.54, null, 146.83, 174.61,
        98.0, null, 123.47, 146.83, 196.0, 146.83, 130.81, 98.0,
      ];
      const b = bassLoop[step];
      if (b) this.tone(now, b, 0.18, 0.12, "sawtooth");

      const hook = [
        523.25, null, 659.25, 783.99, null, 659.25, 523.25, 392.0,
        440.0, null, 523.25, 659.25, null, 783.99, 659.25, null,
        587.33, 659.25, 783.99, 880.0, null, 783.99, 659.25, 523.25,
        659.25, 783.99, 987.77, 880.0, 783.99, 659.25, 523.25, null,
      ];
      const m = hook[step];
      if (m) this.tone(now, m, 0.16, 0.07, "square");
    } catch {
      // ignore
    }

    this.bgmStep++;
    this.bgmTimeout = window.setTimeout(() => this.scheduleNextMenuBeat(), stepMs);
  }

  public startGameplayBGM(secondsRemaining = 60) {
    if (this.isMuted) return;
    this.gameSecondsLeft = secondsRemaining;
    if (this.currentBgmMode === "game") return;
    this.stopBGM();
    this.currentBgmMode = "game";
    this.bgmStep = 0;
    this.scheduleNextGameBeat();
  }

  public updateGameTension(secondsRemaining: number) {
    this.gameSecondsLeft = secondsRemaining;
  }

  private scheduleNextGameBeat() {
    if (this.currentBgmMode !== "game" || this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const hot = this.gameSecondsLeft <= 10;
    const rush = this.gameSecondsLeft <= 5;
    const stepMs = rush ? 92 : hot ? 108 : 124;
    const step = this.bgmStep % 16;
    const now = ctx.currentTime;

    try {
      if (step % 4 === 0) this.kick(now, rush ? 0.32 : 0.28);
      if (hot && step === 6) this.kick(now, 0.16);
      if (step === 4 || step === 12) this.snare(now, rush ? 0.18 : 0.14);
      this.hat(now, step % 4 === 3, rush ? 0.06 : 0.04);

      const bass = [82.41, 82.41, 110.0, 123.47, 98.0, 98.0, 130.81, 146.83, 82.41, 110.0, 123.47, 146.83, 98.0, 82.41, 110.0, 130.81];
      this.tone(now, bass[step], 0.12, 0.11, "sawtooth");

      if (step === 0 || step === 8) {
        this.tone(now, hot ? 659.25 : 523.25, 0.1, 0.05, "square");
      }
      if (rush && step % 2 === 0) {
        this.tone(now, 1046.5, 0.04, 0.035, "square");
      }
    } catch {
      // ignore
    }

    this.bgmStep++;
    this.bgmTimeout = window.setTimeout(() => this.scheduleNextGameBeat(), stepMs);
  }

  public stopBGM() {
    this.currentBgmMode = "none";
    if (this.bgmTimeout) {
      window.clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  private ttsAudio: HTMLAudioElement | null = null;
  private ttsToken = 0;
  private voicesPrimed = false;

  private primeVoices() {
    if (this.voicesPrimed || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voicesPrimed = true;
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    } catch {
      // ignore
    }
  }

  private stopSpeech() {
    this.ttsToken += 1;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }
    if (this.ttsAudio) {
      const audio = this.ttsAudio;
      this.ttsAudio = null;
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // ignore
      }
    }
  }

  private bcp47(lang: string): string {
    const map: Record<string, string> = {
      'en-US': 'en-US',
      en: 'en-GB',
      nl: 'nl-NL',
      de: 'de-DE',
      fr: 'fr-FR',
      es: 'es-ES',
      it: 'it-IT',
      fa: 'fa-IR',
      ar: 'ar-SA',
      tr: 'tr-TR',
      pl: 'pl-PL',
      uk: 'uk-UA',
      zh: 'zh-CN',
      ja: 'ja-JP',
      ko: 'ko-KR',
      hi: 'hi-IN',
      pt: 'pt-PT',
    };
    if (map[lang]) return map[lang];
    if (lang.includes('-')) return lang;
    return lang || 'en-US';
  }

  /** Google Translate TTS language tag (not always the same as BCP-47). */
  private googleTl(lang: string): string {
    const map: Record<string, string> = {
      'en-US': 'en-US',
      en: 'en-GB',
      nl: 'nl',
      de: 'de',
      fr: 'fr',
      es: 'es',
      it: 'it',
      fa: 'fa',
      ar: 'ar',
      tr: 'tr',
      pl: 'pl',
      uk: 'uk',
      zh: 'zh-CN',
      ja: 'ja',
      ko: 'ko',
      hi: 'hi',
      pt: 'pt',
    };
    if (map[lang]) return map[lang];
    return this.bcp47(lang).split('-')[0] || 'en';
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  }

  private pickVoice(bcp: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    const lower = bcp.toLowerCase();
    const prefix = lower.split('-')[0];
    return (
      voices.find((v) => v.lang.toLowerCase() === lower) ||
      voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix + '-')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
      null
    );
  }

  private chunkText(text: string, max = 180): string[] {
    const clean = text.trim();
    if (clean.length <= max) return [clean];
    const parts: string[] = [];
    let rest = clean;
    while (rest.length > max) {
      let cut = Math.max(rest.lastIndexOf(' ', max), rest.lastIndexOf('،', max), rest.lastIndexOf('。', max));
      if (cut < 24) cut = max;
      parts.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) parts.push(rest);
    return parts.filter(Boolean);
  }

  private googleTtsUrl(text: string, tl: string, alt = false): string {
    const q = encodeURIComponent(text);
    const lang = encodeURIComponent(tl);
    if (alt) {
      return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${q}`;
    }
    return `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${lang}&q=${q}`;
  }

  private playOnlineChunks(chunks: string[], tl: string, index: number, token: number) {
    if (token !== this.ttsToken) return;
    if (index >= chunks.length) return;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = this.googleTtsUrl(chunks[index], tl, false);
    this.ttsAudio = audio;

    const playNext = () => {
      if (token !== this.ttsToken) return;
      this.playOnlineChunks(chunks, tl, index + 1, token);
    };

    audio.onended = playNext;
    audio.onerror = () => {
      if (token !== this.ttsToken) return;
      if (audio.dataset.altTried === '1') {
        playNext();
        return;
      }
      audio.dataset.altTried = '1';
      audio.src = this.googleTtsUrl(chunks[index], tl, true);
      audio.play().catch(() => playNext());
    };
    audio.play().catch(() => {
      if (token !== this.ttsToken) return;
      audio.src = this.googleTtsUrl(chunks[index], tl, true);
      audio.play().catch(() => playNext());
    });
  }

  private speakOnline(text: string, lang: string): boolean {
    if (!this.isOnline()) return false;
    const chunks = this.chunkText(text);
    if (chunks.length === 0) return false;
    const token = this.ttsToken;
    this.playOnlineChunks(chunks, this.googleTl(lang), 0, token);
    return true;
  }

  /**
   * Pronounce any phrase in any supported language.
   * Uses a matching device voice when one exists; otherwise falls back to
   * online TTS so Persian, Arabic, Hindi, Ukrainian, Chinese, etc. still work.
   */
  public speak(text: string, lang: string = 'en-US', opts?: { force?: boolean }): void {
    if (typeof window === 'undefined') return;
    const cleanText = (text || '').replace(/[()[\]"«»]/g, '').trim();
    if (!cleanText) return;
    if (this.isMuted && !opts?.force) return;

    this.primeVoices();
    this.stopSpeech();

    const bcp = this.bcp47(lang);
    const voice = this.pickVoice(bcp);
    const online = this.isOnline();

    // No matching local voice: don't let the default English voice mangle it.
    if (!voice && online) {
      this.speakOnline(cleanText, lang);
      return;
    }

    if (!('speechSynthesis' in window)) {
      if (online) this.speakOnline(cleanText, lang);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = bcp;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (voice) utterance.voice = voice;
      utterance.onerror = () => {
        if (online) this.speakOnline(cleanText, lang);
      };
      window.setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          if (online) this.speakOnline(cleanText, lang);
        }
      }, 40);
    } catch {
      if (online) this.speakOnline(cleanText, lang);
    }
  }

  public speakTargetPhrase(text: string, lang: string = 'en-US'): void {
    this.speak(text, lang);
  }
}


export const sound = new SoundManager();
