import { useState, useRef } from 'react';
import { AudioEngine } from '../utils/audioEngine';
import { Note, ChordCell } from '../types/music';

interface AudioPreviewProps {
  songKey: Note;
  grid: ChordCell[][];
  tempo: number;
  onTempoChange: (tempo: number) => void;
}

export default function AudioPreview({ songKey, grid, tempo, onTempoChange }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());

  const handlePlay = async () => {
    if (isPlaying) return;

    setIsPlaying(true);

    // Flatten the grid into a sequence of chords
    const sequence = grid.flat()
      .filter(cell => cell.chord !== null)
      .map(cell => ({
        chord: cell.chord!,
        duration: cell.duration
      }));

    if (sequence.length === 0) {
      alert('No chords to play! Add some chords to the grid first.');
      setIsPlaying(false);
      return;
    }

    try {
      await audioEngineRef.current.playSequence(sequence, songKey, tempo);
    } catch (error) {
      console.error('Error playing sequence:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    audioEngineRef.current.stop();
    setIsPlaying(false);
  };

  return (
    <div className="audio-preview">
      <h2>Playback Controls</h2>

      <div className="tempo-control">
        <label htmlFor="tempo">Tempo (BPM):</label>
        <input
          type="number"
          id="tempo"
          min="40"
          max="240"
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          disabled={isPlaying}
        />
      </div>

      <div className="playback-buttons">
        <button
          className="play-btn"
          onClick={handlePlay}
          disabled={isPlaying}
        >
          {isPlaying ? 'Playing...' : '▶ Play'}
        </button>

        <button
          className="stop-btn"
          onClick={handleStop}
          disabled={!isPlaying}
        >
          ■ Stop
        </button>
      </div>

      <div className="song-info">
        <p>Key: <strong>{songKey}</strong></p>
        <p>Tempo: <strong>{tempo} BPM</strong></p>
        <p>Total Chords: <strong>{grid.flat().filter(c => c.chord !== null).length}</strong></p>
      </div>
    </div>
  );
}
