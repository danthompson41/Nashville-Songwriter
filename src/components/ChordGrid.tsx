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
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [inputValue, setInputValue] = useState('');
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

  const handleCellClick = (row: number, col: number, e: React.MouseEvent) => {
    if (e.detail === 2) {
      // Double-click to edit
      setEditingCell({ row, col });
      const chord = grid[row][col].chord;
      setInputValue(chord ? formatChordForInput(chord) : '');
    } else {
      setSelectedCell({ row, col });
    }
  };

  const formatChordForInput = (chord: NashvilleChord): string => {
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

  const parseChordInput = (input: string): NashvilleChord | null => {
    if (!input.trim()) return null;
    
    const match = input.match(/^([1-7])(.*)$/);
    if (!match) return null;
    
    const degree = parseInt(match[1]);
    const qualityStr = match[2].toLowerCase().trim();
    
    let quality: ChordQuality = getDefaultChordQuality(degree);
    
    if (qualityStr === 'm' || qualityStr === 'min') quality = 'minor';
    else if (qualityStr === 'dim' || qualityStr === '°') quality = 'diminished';
    else if (qualityStr === 'aug' || qualityStr === '+') quality = 'augmented';
    else if (qualityStr === '7') quality = '7';
    else if (qualityStr === 'm7' || qualityStr === 'maj7') quality = 'maj7';
    else if (qualityStr === 'min7' || qualityStr === 'm7') quality = 'min7';
    else if (qualityStr === 'dim7') quality = 'dim7';
    else if (qualityStr === 'sus2') quality = 'sus2';
    else if (qualityStr === 'sus4') quality = 'sus4';
    else if (qualityStr === '') quality = degree === 2 || degree === 3 || degree === 6 ? 'minor' : degree === 7 ? 'diminished' : 'major';
    
    return { degree, quality };
  };

  const handleInputSubmit = () => {
    if (editingCell) {
      const chord = parseChordInput(inputValue);
      updateCell(editingCell.row, editingCell.col, chord);
      setEditingCell(null);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setInputValue('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleInputSubmit();
      // Move to next cell
      if (editingCell) {
        const nextCol = (editingCell.col + 1) % 4;
        const nextRow = nextCol === 0 ? Math.min(editingCell.row + 1, grid.length - 1) : editingCell.row;
        setEditingCell({ row: nextRow, col: nextCol });
        const nextChord = grid[nextRow][nextCol].chord;
        setInputValue(nextChord ? formatChordForInput(nextChord) : '');
      }
    }
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
    <>
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

                    const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;

                    return (
                      <div
                        key={colIdx}
                        className={`chord-cell ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''} ${isEditing ? 'editing' : ''}`}
                        onClick={(e) => handleCellClick(rowIdx, colIdx, e)}
                        title="Double-click to edit, or use number keys 1-7"
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            className="chord-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleInputSubmit}
                            autoFocus
                            placeholder="1-7"
                          />
                        ) : (
                          renderChord(cell.chord)
                        )}
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
      </div>

      {selectedCell && (
        <div className="inspector-panel">
          <h3>Inspector</h3>
          <div className="direct-input-section">
            <label className="direct-input-label">Direct Text Input:</label>
            <div className="direct-input-wrapper">
              <input
                type="text"
                className="direct-chord-input"
                placeholder="Type chord (e.g., 1, 2m, 5, 4M7, 7dim) and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const chord = parseChordInput(e.currentTarget.value);
                    if (chord) {
                      updateCell(selectedCell.row, selectedCell.col, chord);
                      e.currentTarget.value = '';
                    }
                  }
                }}
                autoFocus
              />
              <div className="input-hint">↵ Enter to apply</div>
            </div>
          </div>
          
          <div className="quick-help">
            <p><strong>Quick Input Guide:</strong></p>
            <ul>
              <li>Double-click any cell to edit inline</li>
              <li>Type number (1-7) for Nashville notation</li>
              <li>Add quality: m, dim, aug, 7, M7, etc.</li>
              <li>Press Enter to confirm, Tab to next</li>
              <li>Examples: "1", "2m", "5", "4M7", "7dim"</li>
            </ul>
          </div>
          
          <div className="inspector-cell-info">
            <span className="inspector-label">Track:</span>
            <span>{trackNames[selectedCell.row]}</span>
          </div>
          <div className="inspector-cell-info">
            <span className="inspector-label">Beat:</span>
            <span>{selectedCell.col + 1}</span>
          </div>

          <div className="inspector-section degree-selector">
            <label className="inspector-section-label">Quick Nashville Numbers:</label>
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
    </>
  );
}
