import { useState } from "react";
import "./App.css";
import TransportBar from "./components/TransportBar";
import ChordGrid from "./components/ChordGrid";
import AudioPreview from "./components/AudioPreview";
import { Note, ChordCell } from "./types/music";

function App() {
  const [songKey, setSongKey] = useState<Note>('C');
  const [tempo, setTempo] = useState<number>(120);
  const [grid, setGrid] = useState<ChordCell[][]>([
    Array(4).fill(null).map(() => ({ chord: null, duration: 1 })),
    Array(4).fill(null).map(() => ({ chord: null, duration: 1 })),
    Array(4).fill(null).map(() => ({ chord: null, duration: 1 })),
    Array(4).fill(null).map(() => ({ chord: null, duration: 1 })),
  ]);

  // Use the AudioPreview hook for playback control
  const playback = AudioPreview({
    songKey,
    grid,
    tempo,
    onTempoChange: setTempo
  });

  const totalBeats = grid.flat().length;

  return (
    <main className="daw-container">
      <header className="daw-header">
        <div className="app-title">
          <h1>Nashville Number System DAW</h1>
        </div>
      </header>

      <TransportBar
        isPlaying={playback.isPlaying}
        isPaused={playback.isPaused}
        onPlay={playback.handlePlay}
        onPause={playback.handlePause}
        onStop={playback.handleStop}
        tempo={tempo}
        onTempoChange={setTempo}
        songKey={songKey}
        onKeyChange={setSongKey}
        currentBeat={playback.currentBeat}
        totalBeats={totalBeats}
      />

      <div className="daw-main">
        <div className="arrangement-section">
          <ChordGrid
            grid={grid}
            onGridChange={setGrid}
            currentBeat={playback.isPlaying ? playback.currentBeat : undefined}
          />
        </div>
      </div>

      <footer className="daw-footer">
        <p>Nashville Number System: I (1) • ii (2m) • iii (3m) • IV (4) • V (5) • vi (6m) • vii° (7°)</p>
      </footer>
    </main>
  );
}

export default App;
