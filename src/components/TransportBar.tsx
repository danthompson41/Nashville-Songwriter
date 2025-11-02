import { Note } from '../types/music';

interface TransportBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  tempo: number;
  onTempoChange: (tempo: number) => void;
  songKey: Note;
  onKeyChange: (key: Note) => void;
  currentBeat: number;
  totalBeats: number;
}

export default function TransportBar({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  tempo,
  onTempoChange,
  songKey,
  onKeyChange,
  currentBeat,
  totalBeats
}: TransportBarProps) {
  const currentMeasure = Math.floor(currentBeat / 4) + 1;
  const currentBeatInMeasure = (currentBeat % 4) + 1;

  return (
    <div className="transport-bar">
      <div className="transport-section transport-controls">
        <button
          className="transport-btn stop-btn"
          onClick={onStop}
          title="Stop"
          disabled={!isPlaying && !isPaused}
        >
          ■
        </button>

        {!isPlaying || isPaused ? (
          <button
            className="transport-btn play-btn-transport"
            onClick={onPlay}
            title="Play"
          >
            ▶
          </button>
        ) : (
          <button
            className="transport-btn pause-btn"
            onClick={onPause}
            title="Pause"
          >
            ⏸
          </button>
        )}
      </div>

      <div className="transport-section position-display">
        <div className="position-label">Position</div>
        <div className="position-value">
          {currentMeasure}.{currentBeatInMeasure}
        </div>
      </div>

      <div className="transport-section tempo-section">
        <label htmlFor="transport-tempo">BPM</label>
        <input
          type="number"
          id="transport-tempo"
          className="tempo-input"
          min="40"
          max="240"
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          disabled={isPlaying}
        />
      </div>

      <div className="transport-section key-section">
        <label htmlFor="transport-key">Key</label>
        <select
          id="transport-key"
          className="key-select"
          value={songKey}
          onChange={(e) => onKeyChange(e.target.value as Note)}
          disabled={isPlaying}
        >
          {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>

      <div className="transport-section time-signature">
        <span>4/4</span>
      </div>
    </div>
  );
}
