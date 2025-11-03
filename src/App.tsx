import { useState, useEffect } from "react";
import "./App.css";
import TransportBar from "./components/TransportBar";
import SectionGrid from "./components/SectionGrid";
import ProjectManager from "./components/ProjectManager";
import AudioPreview from "./components/AudioPreview";
import { Song, Section, SECTION_TYPES, NashvilleChord, ChordQuality, CHORD_QUALITIES, getDefaultChordQuality } from "./types/music";
import { createEmptySong, duplicateSection, createSection, saveSongToStorage } from "./utils/songHelpers";

function App() {
  const [song, setSong] = useState<Song>(createEmptySong());
  const [currentPosition, setCurrentPosition] = useState<{ sectionIndex: number; measureIndex: number; beatIndex: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ sectionIndex: number; measureIndex: number; beatIndex: number } | null>(null);

  // Use the AudioPreview hook for playback control
  const playback = AudioPreview({
    song,
    onPlaybackPosition: setCurrentPosition
  });

  // Auto-save on song changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveSongToStorage(song);
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [song]);

  const handleSongUpdate = (updatedSong: Song) => {
    setSong(updatedSong);
  };

  const handleSectionUpdate = (sectionIndex: number, updatedSection: Section) => {
    const newSections = [...song.sections];
    newSections[sectionIndex] = updatedSection;
    setSong({ ...song, sections: newSections });
  };

  const handleDuplicateSection = (sectionIndex: number) => {
    const section = song.sections[sectionIndex];
    const duplicated = duplicateSection(section);
    const newSections = [...song.sections];
    newSections.splice(sectionIndex + 1, 0, duplicated);
    setSong({ ...song, sections: newSections });
  };

  const handleDeleteSection = (sectionIndex: number) => {
    if (song.sections.length <= 1) {
      alert('Cannot delete the last section');
      return;
    }
    const newSections = song.sections.filter((_, idx) => idx !== sectionIndex);
    setSong({ ...song, sections: newSections });
  };

  const handleAddSection = () => {
    const sectionType = SECTION_TYPES[0]; // Default to Verse
    const newSection = createSection(sectionType, undefined, 4);
    setSong({ ...song, sections: [...song.sections, newSection] });
  };

  const handleLoadSong = (loadedSong: Song) => {
    setSong(loadedSong);
    playback.handleStop();
  };

  const handleNewSong = () => {
    setSong(createEmptySong());
    playback.handleStop();
  };

  const handleSongMetadataChange = (field: keyof Song, value: string) => {
    setSong({ ...song, [field]: value });
  };

  const handleCellClick = (sectionIndex: number, measureIndex: number, beatIndex: number) => {
    setSelectedCell({ sectionIndex, measureIndex, beatIndex });
  };

  const updateCell = (chord: NashvilleChord | null) => {
    if (!selectedCell) return;
    
    const newSections = [...song.sections];
    const section = newSections[selectedCell.sectionIndex];
    const newMeasures = section.measures.map((measure, mIdx) =>
      measure.map((cell, bIdx) => {
        if (mIdx === selectedCell.measureIndex && bIdx === selectedCell.beatIndex) {
          return { ...cell, chord };
        }
        return cell;
      })
    );
    
    newSections[selectedCell.sectionIndex] = {
      ...section,
      measures: newMeasures
    };
    
    setSong({ ...song, sections: newSections });
  };

  const handleChordInput = (degree: number, quality: ChordQuality) => {
    const chord: NashvilleChord = { degree, quality };
    updateCell(chord);
  };

  const clearCell = () => {
    updateCell(null);
  };

  return (
    <main className="daw-container">
      <header className="daw-header">
        <div className="app-title">
          <h1>Nashville Number System DAW</h1>
        </div>
        <ProjectManager
          currentSong={song}
          onLoadSong={handleLoadSong}
          onNewSong={handleNewSong}
        />
      </header>

      <div className="song-metadata">
        <input
          type="text"
          className="song-title-input"
          value={song.title}
          onChange={(e) => handleSongMetadataChange('title', e.target.value)}
          placeholder="Song Title"
        />
        <input
          type="text"
          className="song-artist-input"
          value={song.artist}
          onChange={(e) => handleSongMetadataChange('artist', e.target.value)}
          placeholder="Artist"
        />
      </div>

      <TransportBar
        song={song}
        isPlaying={playback.isPlaying}
        isPaused={playback.isPaused}
        onPlay={playback.handlePlay}
        onPause={playback.handlePause}
        onStop={playback.handleStop}
        onSongUpdate={handleSongUpdate}
        currentPosition={playback.currentPosition}
      />

      <div className="daw-main">
        <div className="sections-container" style={{ marginRight: selectedCell ? '320px' : '0' }}>
          {song.sections.map((section, index) => (
            <SectionGrid
              key={section.id}
              section={section}
              sectionIndex={index}
              onUpdateSection={(updatedSection) => handleSectionUpdate(index, updatedSection)}
              onDuplicateSection={() => handleDuplicateSection(index)}
              onDeleteSection={() => handleDeleteSection(index)}
              canDelete={song.sections.length > 1}
              currentBeat={playback.isPlaying ? currentPosition : undefined}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
            />
          ))}

          <button className="add-section-btn" onClick={handleAddSection}>
            + Add Section
          </button>
        </div>

        {selectedCell && (
          <div className="inspector-panel">
            <h3>Inspector</h3>
            <div className="inspector-cell-info">
              <span className="inspector-label">Section:</span>
              <span>{song.sections[selectedCell.sectionIndex].name}</span>
            </div>
            <div className="inspector-cell-info">
              <span className="inspector-label">Measure:</span>
              <span>{selectedCell.measureIndex + 1}</span>
            </div>
            <div className="inspector-cell-info">
              <span className="inspector-label">Beat:</span>
              <span>{selectedCell.beatIndex + 1}</span>
            </div>

            <div className="inspector-section degree-selector">
              <label className="inspector-section-label">Nashville Number:</label>
              <div className="degree-buttons">
                {[1, 2, 3, 4, 5, 6, 7].map((degree) => {
                  const defaultQuality = getDefaultChordQuality(degree);
                  const qualityHint = defaultQuality === 'minor' ? 'm' :
                                     defaultQuality === 'diminished' ? '°' : '';
                  return (
                    <button
                      key={degree}
                      className="degree-btn"
                      onClick={() => handleChordInput(degree, defaultQuality)}
                      title={`Degree ${degree} (${defaultQuality})`}
                    >
                      {degree}{qualityHint}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="inspector-section quality-selector">
              <label className="inspector-section-label">Chord Quality:</label>
              <div className="quality-buttons">
                {CHORD_QUALITIES.map((quality) => (
                  <button
                    key={quality}
                    className="quality-btn"
                    onClick={() => {
                      const currentChord = song.sections[selectedCell.sectionIndex]
                        .measures[selectedCell.measureIndex][selectedCell.beatIndex].chord;
                      const currentDegree = currentChord?.degree || 1;
                      handleChordInput(currentDegree, quality);
                    }}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>

            <button className="clear-btn" onClick={clearCell}>
              Clear Cell
            </button>
          </div>
        )}
      </div>

      <footer className="daw-footer">
        <p>Nashville Number System: I (1) • ii (2m) • iii (3m) • IV (4) • V (5) • vi (6m) • vii° (7°)</p>
      </footer>
    </main>
  );
}

export default App;
