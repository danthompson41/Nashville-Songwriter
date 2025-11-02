// Helper functions for creating and managing songs and sections

import { Section, SectionType, ChordCell, Song, Note } from '../types/music';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createEmptyMeasure(beatsPerMeasure: number = 4): ChordCell[] {
  return Array(beatsPerMeasure).fill(null).map(() => ({
    chord: null,
    duration: 1
  }));
}

export function createSection(
  type: SectionType,
  name?: string,
  measuresCount: number = 4
): Section {
  const sectionNumber = name ? '' : ' 1';
  return {
    id: generateId(),
    type,
    name: name || `${type}${sectionNumber}`,
    lyrics: '',
    measures: Array(measuresCount).fill(null).map(() => createEmptyMeasure(4))
  };
}

export function duplicateSection(section: Section): Section {
  return {
    ...section,
    id: generateId(),
    measures: section.measures.map(measure =>
      measure.map(cell => ({ ...cell }))
    )
  };
}

export function createEmptySong(key: Note = 'C', tempo: number = 120): Song {
  return {
    id: generateId(),
    title: 'Untitled Song',
    artist: '',
    key,
    tempo,
    timeSignature: {
      numerator: 4,
      denominator: 4
    },
    sections: [
      createSection('Verse', 'Verse 1', 4),
      createSection('Chorus', 'Chorus', 4)
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: ''
  };
}

export function addMeasureToSection(section: Section, atIndex?: number): Section {
  const newMeasures = [...section.measures];
  const index = atIndex !== undefined ? atIndex : newMeasures.length;
  newMeasures.splice(index, 0, createEmptyMeasure(4));

  return {
    ...section,
    measures: newMeasures
  };
}

export function removeMeasureFromSection(section: Section, index: number): Section {
  if (section.measures.length <= 1) {
    return section; // Don't remove the last measure
  }

  return {
    ...section,
    measures: section.measures.filter((_, i) => i !== index)
  };
}

export function getSectionDisplayName(section: Section): string {
  return section.name;
}

export function getTotalBeats(song: Song): number {
  return song.sections.reduce((total, section) => {
    const sectionBeats = section.measures.reduce((measureTotal, measure) => {
      return measureTotal + measure.length;
    }, 0);
    return total + sectionBeats;
  }, 0);
}

// Get the section and beat index for a given absolute beat position
export function getBeatPosition(song: Song, absoluteBeat: number): { sectionIndex: number; measureIndex: number; beatIndex: number } | null {
  let beatCounter = 0;

  for (let sectionIndex = 0; sectionIndex < song.sections.length; sectionIndex++) {
    const section = song.sections[sectionIndex];

    for (let measureIndex = 0; measureIndex < section.measures.length; measureIndex++) {
      const measure = section.measures[measureIndex];

      for (let beatIndex = 0; beatIndex < measure.length; beatIndex++) {
        if (beatCounter === absoluteBeat) {
          return { sectionIndex, measureIndex, beatIndex };
        }
        beatCounter++;
      }
    }
  }

  return null;
}

// Save song to localStorage
export function saveSongToStorage(song: Song): void {
  const updatedSong = {
    ...song,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(`song-${song.id}`, JSON.stringify(updatedSong));

  // Update the list of saved songs
  const savedSongsJson = localStorage.getItem('saved-songs');
  const savedSongs: Array<{ id: string; title: string; updatedAt: string }> = savedSongsJson
    ? JSON.parse(savedSongsJson)
    : [];

  const existingIndex = savedSongs.findIndex(s => s.id === song.id);
  const songInfo = {
    id: updatedSong.id,
    title: updatedSong.title,
    updatedAt: updatedSong.updatedAt
  };

  if (existingIndex >= 0) {
    savedSongs[existingIndex] = songInfo;
  } else {
    savedSongs.push(songInfo);
  }

  localStorage.setItem('saved-songs', JSON.stringify(savedSongs));
}

// Load song from localStorage
export function loadSongFromStorage(songId: string): Song | null {
  const songJson = localStorage.getItem(`song-${songId}`);
  if (!songJson) return null;

  try {
    return JSON.parse(songJson);
  } catch (e) {
    console.error('Error parsing song:', e);
    return null;
  }
}

// Get list of saved songs
export function getSavedSongsList(): Array<{ id: string; title: string; updatedAt: string }> {
  const savedSongsJson = localStorage.getItem('saved-songs');
  if (!savedSongsJson) return [];

  try {
    return JSON.parse(savedSongsJson);
  } catch (e) {
    console.error('Error parsing saved songs list:', e);
    return [];
  }
}

// Delete song from storage
export function deleteSongFromStorage(songId: string): void {
  localStorage.removeItem(`song-${songId}`);

  const savedSongsJson = localStorage.getItem('saved-songs');
  if (!savedSongsJson) return;

  try {
    const savedSongs = JSON.parse(savedSongsJson);
    const filtered = savedSongs.filter((s: { id: string }) => s.id !== songId);
    localStorage.setItem('saved-songs', JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting song:', e);
  }
}
