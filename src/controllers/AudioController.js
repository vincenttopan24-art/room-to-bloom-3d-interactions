export const AUDIO_LABELS = ['Forest Ambience', 'Rain Sounds', 'Ocean Waves', 'Café Ambience', 'Soft Instrumental', 'Lo-Fi Study', 'White Noise'];
const filenames = ['forest', 'rain', 'ocean', 'cafe', 'instrumental', 'lofi', 'white-noise'];
export const DEFAULT_TRACKS = AUDIO_LABELS.map((label, index) => ({ label, src: `/audio/${filenames[index]}.wav`, license: 'CC0-1.0', attribution: 'Original synthesized ROOM TO BLOOM demo audio; generated offline by scripts/generate-audio.py; dedicated to CC0.' }));

/** Browser audio lifecycle, independent from React and application state. */
export class AudioController {
  constructor({ tracks = DEFAULT_TRACKS, onStateChange = () => {}, AudioClass = globalThis.Audio } = {}) {
    this.tracks = tracks;
    this.onStateChange = onStateChange;
    this.AudioClass = AudioClass;
    this.volume = 0.5;
    this.track = null;
    this.audio = null;
    this.generation = 0;
    this.disposed = false;
    this.wantsPlayback = false;
    this.listeners = [];
  }
  report(status, error) {
    this.status = status;
    this.onStateChange({ track: this.track, status, ...(error ? { error } : {}) });
  }
  release() {
    this.wantsPlayback = false;
    this.generation++;
    if (!this.audio) return;
    this.listeners.forEach(([event, handler]) => this.audio.removeEventListener(event, handler));
    this.listeners = [];
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.audio = null;
  }
  async play(index) {
    if (this.disposed) return false;
    this.release();
    this.track = index;
    if (!Number.isInteger(index) || !this.tracks[index]?.src || !this.AudioClass) {
      this.report('error', 'Audio source is unavailable.');
      return false;
    }
    try {
      this.audio = new this.AudioClass(this.tracks[index].src);
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;
      const audio = this.audio;
      const playing = () => {
        if (this.audio === audio && this.wantsPlayback) this.report('playing');
      };
      const error = () => {
        if (this.audio !== audio) return;
        this.generation++;
        this.wantsPlayback = false;
        audio.pause();
        this.report('error', audio.error?.message || 'Audio could not be loaded.');
      };
      this.listeners = [['playing', playing], ['error', error]];
      this.listeners.forEach(([event, handler]) => audio.addEventListener(event, handler));
      return await this.start();
    } catch (error) {
      this.report('error', error.message || 'Audio could not be created.');
      return false;
    }
  }
  async start() {
    const audio = this.audio;
    const generation = ++this.generation;
    this.wantsPlayback = true;
    this.report('loading');
    try {
      await audio.play();
      if (this.generation !== generation || this.audio !== audio || !this.wantsPlayback) {
        if (this.audio !== audio || !this.wantsPlayback) audio.pause();
        return false;
      }
      this.report('playing');
      return true;
    } catch (error) {
      if (this.generation !== generation || this.audio !== audio) return false;
      this.wantsPlayback = false;
      this.report('error', error.message || 'Playback was blocked. Select play to retry.');
      return false;
    }
  }
  pause() {
    if (this.disposed || !this.audio) return;
    this.generation++;
    this.wantsPlayback = false;
    this.audio.pause();
    this.report('paused');
  }
  resume() {
    if (this.disposed || !this.audio) return Promise.resolve(false);
    return this.start();
  }
  stop() {
    if (this.disposed) return;
    this.release();
    this.report('stopped');
  }
  setVolume(volume) {
    if (!Number.isFinite(volume) || volume < 0 || volume > 1) throw new RangeError('Volume must be between 0 and 1.');
    this.volume = volume;
    if (this.audio) this.audio.volume = volume;
  }
  dispose() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
  }
}
