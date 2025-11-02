// Audio synthesis engine using Web Audio API

import { Note, NashvilleChord, ChordQuality, NOTES } from '../types/music';

// Frequency map for notes (A4 = 440Hz)
const NOTE_FREQUENCIES: Record<Note, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88
};

// Major scale intervals (semitones from root)
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Chord formulas (intervals from root in semitones)
const CHORD_FORMULAS: Record<ChordQuality, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  'dim7': [0, 3, 6, 9]
};

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    this.initAudio();
  }

  private initAudio() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);
  }

  private getNoteFromDegree(key: Note, degree: number): Note {
    const keyIndex = NOTES.indexOf(key);
    const scaleInterval = MAJOR_SCALE_INTERVALS[degree - 1];
    const noteIndex = (keyIndex + scaleInterval) % 12;
    return NOTES[noteIndex];
  }

  private getFrequency(note: Note, octave: number = 4): number {
    const baseFreq = NOTE_FREQUENCIES[note];
    return baseFreq * Math.pow(2, octave - 4);
  }

  private nashvilleToFrequencies(chord: NashvilleChord, key: Note): number[] {
    const rootNote = this.getNoteFromDegree(key, chord.degree);
    const rootIndex = NOTES.indexOf(rootNote);
    const formula = CHORD_FORMULAS[chord.quality];

    return formula.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      const note = NOTES[noteIndex];
      return this.getFrequency(note);
    });
  }

  playChord(chord: NashvilleChord, key: Note, duration: number = 1.0) {
    if (!this.audioContext || !this.masterGain) return;

    const frequencies = this.nashvilleToFrequencies(chord, key);
    const now = this.audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      // Envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2 / frequencies.length, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  async playSequence(chords: { chord: NashvilleChord, duration: number }[], key: Note, tempo: number) {
    const beatDuration = 60 / tempo;

    for (let i = 0; i < chords.length; i++) {
      const { chord, duration } = chords[i];
      this.playChord(chord, key, duration * beatDuration);
      await this.sleep(duration * beatDuration * 1000);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.initAudio();
    }
  }
}
