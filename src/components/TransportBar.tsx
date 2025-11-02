import { Song, Note, NOTES } from '../types/music';

interface TransportBarProps {
  song: Song;
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSongUpdate: (song: Song) => void;
  currentPosition: { sectionIndex: number; measureIndex: number; beatIndex: number } | null;
}

export default function TransportBar({
  song,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onSongUpdate,
  currentPosition
}: TransportBarProps) {
  const handleTempoChange = (tempo: number) => {
    onSongUpdate({ ...song, tempo });
  };

  const handleKeyChange = (key: Note) => {
    onSongUpdate({ ...song, key });
  };

  const currentMeasure = currentPosition ? currentPosition.measureIndex + 1 : 1;
  const currentBeatInMeasure = currentPosition ? currentPosition.beatIndex + 1 : 1;

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
          value={song.tempo}
          onChange={(e) => handleTempoChange(Number(e.target.value))}
          disabled={isPlaying}
        />
      </div>

      <div className="transport-section key-section">
        <label htmlFor="transport-key">Key</label>
        <select
          id="transport-key"
          className="key-select"
          value={song.key}
          onChange={(e) => handleKeyChange(e.target.value as Note)}
          disabled={isPlaying}
        >
          {NOTES.map((note) => (
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
