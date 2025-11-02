import { useState } from 'react';
import { ChordCell, NashvilleChord, ChordQuality, CHORD_QUALITIES } from '../types/music';

interface ChordGridProps {
  grid: ChordCell[][];
  onGridChange: (grid: ChordCell[][]) => void;
}

export default function ChordGrid({ grid, onGridChange }: ChordGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

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
  };

  const removeRow = (rowIndex: number) => {
    onGridChange(grid.filter((_, idx) => idx !== rowIndex));
  };

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
      <div className="chord-grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="chord-row">
            {row.map((cell, colIdx) => (
              <div
                key={colIdx}
                className={`chord-cell ${selectedCell?.row === rowIdx && selectedCell?.col === colIdx ? 'selected' : ''}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
              >
                {renderChord(cell.chord)}
              </div>
            ))}
            <button
              className="remove-row-btn"
              onClick={() => removeRow(rowIdx)}
              title="Remove row"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button className="add-row-btn" onClick={addRow}>
        + Add Row
      </button>

      {selectedCell && (
        <div className="chord-input-panel">
          <h3>Edit Cell (Row {selectedCell.row + 1}, Col {selectedCell.col + 1})</h3>

          <div className="degree-selector">
            <label>Degree:</label>
            <div className="degree-buttons">
              {[1, 2, 3, 4, 5, 6, 7].map((degree) => (
                <button
                  key={degree}
                  className="degree-btn"
                  onClick={() => handleChordInput(degree, 'major')}
                >
                  {degree}
                </button>
              ))}
            </div>
          </div>

          <div className="quality-selector">
            <label>Quality:</label>
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
