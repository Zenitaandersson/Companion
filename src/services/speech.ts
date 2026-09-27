import { SPEECH_TAGS } from '../i18n';
import type { Language } from '../data/types';

/**
 * Speaks text or plays a carer recording. Recorded voice always wins when present.
 * All calls are fire-and-forget and never throw: if the phone cannot speak, nothing happens
 * and the text remains on screen.
 */
class SpeechService {
  private audio: HTMLAudioElement | null = null;
  private objectUrl: string | null = null;

  stop(): void {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  speak(text: string, language: Language): void {
    this.stop();
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      if (!('speechSynthesis' in window)) return;
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = SPEECH_TAGS[language];
      utterance.rate = 0.9;
      utterance.pitch = 1;
      const voice = pickVoice(SPEECH_TAGS[language]);
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* stay silent */
    }
  }

  play(blob: Blob): void {
    this.stop();
    try {
      this.objectUrl = URL.createObjectURL(blob);
      this.audio = new Audio(this.objectUrl);
      void this.audio.play().catch(() => undefined);
    } catch {
      /* stay silent */
    }
  }

  /** Recorded audio if available, otherwise synthesized text. */
  say(text: string, audio: Blob | null | undefined, language: Language): void {
    if (audio) this.play(audio);
    else this.speak(text, language);
  }

  /**
   * iOS only allows speech after a user gesture. Calling this from the first tap
   * unlocks synthesis for the rest of the session.
   */
  warmUp(): void {
    try {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }
}

function pickVoice(tag: string): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    const lang = tag.toLowerCase();
    const exact = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === lang);
    const prefix = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
    const pool = exact.length ? exact : prefix;
    if (!pool.length) return null;
    // Prefer local, non-novelty voices.
    return pool.find((v) => v.localService) ?? pool[0];
  } catch {
    return null;
  }
}

export const speech = new SpeechService();
