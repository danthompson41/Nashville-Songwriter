// Music theory types and interfaces for Nashville notation

export type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'sus2' | 'sus4' | '7' | 'maj7' | 'min7' | 'dim7';

export interface NashvilleChord {
  degree: number; // 1-7
  quality: ChordQuality;
  inversion?: number;
  bass?: number; // for slash chords
}

export interface ChordCell {
  chord: NashvilleChord | null;
  duration: number; // in beats
}

export interface Song {
  key: Note;
  tempo: number; // BPM
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  grid: ChordCell[][];
}

export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CHORD_QUALITIES: ChordQuality[] = [
  'major',
  'minor',
  'diminished',
  'augmented',
  'sus2',
  'sus4',
  '7',
  'maj7',
  'min7',
  'dim7'
];
