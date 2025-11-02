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

export type SectionType = 'Verse' | 'Chorus' | 'Bridge' | 'Pre-Chorus' | 'Intro' | 'Outro' | 'Instrumental' | 'Solo' | 'Custom';

export const SECTION_TYPES: SectionType[] = [
  'Verse',
  'Chorus',
  'Bridge',
  'Pre-Chorus',
  'Intro',
  'Outro',
  'Instrumental',
  'Solo',
  'Custom'
];

export const SECTION_COLORS: Record<SectionType, string> = {
  'Verse': '#4a9eff',
  'Chorus': '#ff6b6b',
  'Bridge': '#51cf66',
  'Pre-Chorus': '#ffd43b',
  'Intro': '#a78bfa',
  'Outro': '#a78bfa',
  'Instrumental': '#ff9500',
  'Solo': '#ff9500',
  'Custom': '#888'
};

export interface Section {
  id: string;
  type: SectionType;
  name: string; // e.g., "Verse 1", "Chorus", "Bridge"
  lyrics: string;
  measures: ChordCell[][]; // Each measure is an array of ChordCells (typically 4 beats)
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: Note;
  tempo: number; // BPM
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
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

// Default chord quality for each degree in a major scale
// I = Major, ii = minor, iii = minor, IV = Major, V = Major, vi = minor, vii° = diminished
export function getDefaultChordQuality(degree: number): ChordQuality {
  switch (degree) {
    case 1:
    case 4:
    case 5:
      return 'major';
    case 2:
    case 3:
    case 6:
      return 'minor';
    case 7:
      return 'diminished';
    default:
      return 'major';
  }
}
