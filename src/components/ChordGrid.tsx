import { useState } from 'react';
import { ChordCell, NashvilleChord, ChordQuality, CHORD_QUALITIES, getDefaultChordQuality } from '../types/music';
import Timeline from './Timeline';

interface ChordGridProps {
  grid: ChordCell[][];
  onGridChange: (grid: ChordCell[][]) => void;
  currentBeat?: number;
}

export default function ChordGrid({ grid, onGridChange, currentBeat }: ChordGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [trackNames, setTrackNames] = useState<string[]>(
    grid.map((_, idx) => `Section ${String.fromCharCode(65 + idx)}`)
  );

  const updateCell = (row: number, col: number, chord: NashvilleChord | null) => {
    const newGrid = grid.map((r, rIdx) =>
      r.map((cell, cIdx) => {
        if (rIdx === row && cIdx === col) {
          return { ...cell, chord };
        }
        return cell;
      })
    );
    onGridChange(newGrid);
  };

  const addRow = () => {
    const newRow: ChordCell[] = Array(4).fill(null).map(() => ({
      chord: null,
      duration: 1
    }));
    onGridChange([...grid, newRow]);
    setTrackNames([...trackNames, `Section ${String.fromCharCode(65 + grid.length)}`]);
  };

  const removeRow = (rowIndex: number) => {
    onGridChange(grid.filter((_row, idx) => idx !== rowIndex));
    setTrackNames(trackNames.filter((_name, idx) => idx !== rowIndex));
  };

  const updateTrackName = (rowIndex: number, newName: string) => {
    const newNames = [...trackNames];
    newNames[rowIndex] = newName;
    setTrackNames(newNames);
  };

  // Calculate which cell is currently playing
  const getCurrentCell = () => {
    if (currentBeat === undefined) return null;
    const rowIdx = Math.floor(currentBeat / 4);
    const colIdx = currentBeat % 4;
    return { row: rowIdx, col: colIdx };
  };

  const currentCell = getCurrentCell();
  const totalMeasures = Math.max(grid.length, 1);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleChordInput = (degree: number, quality: ChordQuality) => {
    if (selectedCell) {
      const chord: NashvilleChord = { degree, quality };
      updateCell(selectedCell.row, selectedCell.col, chord);
    }
  };

  const clearCell = () => {
    if (selectedCell) {
      updateCell(selectedCell.row, selectedCell.col, null);
    }
  };

  const renderChord = (chord: NashvilleChord | null) => {
    if (!chord) return '-';
    const qualitySymbol = chord.quality === 'minor' ? 'm' :
                         chord.quality === 'diminished' ? 'dim' :
                         chord.quality === 'augmented' ? 'aug' :
                         chord.quality === '7' ? '7' :
                         chord.quality === 'maj7' ? 'M7' :
                         chord.quality === 'min7' ? 'm7' :
                         chord.quality === 'dim7' ? 'dim7' :
                         chord.quality === 'sus2' ? 'sus2' :
                         chord.quality === 'sus4' ? 'sus4' : '';
    return `${chord.degree}${qualitySymbol}`;
  };

  return (
    <div className="chord-grid-container">
      <div className="arrangement-view">
        <div className="timeline-container">
          <div className="track-header-spacer" />
          <Timeline measures={totalMeasures} beatsPerMeasure={4} currentBeat={currentBeat} />
        </div>

        <div className="tracks-container">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="track">
              <div className="track-header">
                <input
                  type="text"
                  className="track-name-input"
                  value={trackNames[rowIdx] || `Section ${String.fromCharCode(65 + rowIdx)}`}
                  onChange={(e) => updateTrackName(rowIdx, e.target.value)}
                  placeholder="Track name"
                />
                <button
                  className="remove-track-btn"
                  onClick={() => removeRow(rowIdx)}
                  title="Remove track"
                >
                  ×
                </button>
              </div>

              <div className="track-cells">
                {row.map((cell, colIdx) => {
                  const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                  const isPlaying = currentCell?.row === rowIdx && currentCell?.col === colIdx;

                  return (
                    <div
                      key={colIdx}
                      className={`chord-cell ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                    >
                      {renderChord(cell.chord)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button className="add-track-btn" onClick={addRow}>
          + Add Track
        </button>
      </div>

      {selectedCell && (
        <div className="inspector-panel">
          <h3>Inspector</h3>
          <div className="inspector-cell-info">
            <span className="inspector-label">Track:</span>
            <span>{trackNames[selectedCell.row]}</span>
          </div>
          <div className="inspector-cell-info">
            <span className="inspector-label">Beat:</span>
            <span>{selectedCell.col + 1}</span>
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
                    const currentDegree = grid[selectedCell.row][selectedCell.col].chord?.degree || 1;
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
  );
}
