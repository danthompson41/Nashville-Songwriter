import { useState } from "react";
import "./App.css";
import KeySelector from "./components/KeySelector";
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

  return (
    <main className="container">
      <header className="app-header">
        <h1>Nashville Songwriter DAW</h1>
        <p className="subtitle">Write chords in Nashville notation and preview in any key</p>
      </header>

      <div className="controls-section">
        <KeySelector selectedKey={songKey} onKeyChange={setSongKey} />
      </div>

      <div className="main-content">
        <div className="grid-section">
          <h2>Chord Grid</h2>
          <p className="instruction">Click a cell to select it, then choose a degree (1-7) and quality</p>
          <ChordGrid grid={grid} onGridChange={setGrid} />
        </div>

        <div className="preview-section">
          <AudioPreview
            songKey={songKey}
            grid={grid}
            tempo={tempo}
            onTempoChange={setTempo}
          />
        </div>
      </div>

      <footer className="app-footer">
        <p>Nashville notation: 1 = Tonic, 2 = Supertonic, 3 = Mediant, 4 = Subdominant, 5 = Dominant, 6 = Submediant, 7 = Leading tone</p>
      </footer>
    </main>
  );
}

export default App;
