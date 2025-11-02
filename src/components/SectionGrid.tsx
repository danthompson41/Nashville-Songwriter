import { useState } from 'react';
import { Section, ChordCell, NashvilleChord, ChordQuality, CHORD_QUALITIES, getDefaultChordQuality, SECTION_COLORS } from '../types/music';
import { addMeasureToSection, removeMeasureFromSection } from '../utils/songHelpers';
import SectionHeader from './SectionHeader';

interface SectionGridProps {
  section: Section;
  sectionIndex: number;
  onUpdateSection: (section: Section) => void;
  onDuplicateSection: () => void;
  onDeleteSection: () => void;
  canDelete: boolean;
  currentBeat?: { sectionIndex: number; measureIndex: number; beatIndex: number };
}

export default function SectionGrid({
  section,
  sectionIndex,
  onUpdateSection,
  onDuplicateSection,
  onDeleteSection,
  canDelete,
  currentBeat
}: SectionGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ measureIndex: number; beatIndex: number } | null>(null);

  const updateCell = (measureIndex: number, beatIndex: number, chord: NashvilleChord | null) => {
    const newMeasures = section.measures.map((measure, mIdx) =>
      measure.map((cell, bIdx) => {
        if (mIdx === measureIndex && bIdx === beatIndex) {
          return { ...cell, chord };
        }
        return cell;
      })
    );

    onUpdateSection({
      ...section,
      measures: newMeasures
    });
  };

  const handleCellClick = (measureIndex: number, beatIndex: number) => {
    setSelectedCell({ measureIndex, beatIndex });
  };

  const handleChordInput = (degree: number, quality: ChordQuality) => {
    if (selectedCell) {
      const chord: NashvilleChord = { degree, quality };
      updateCell(selectedCell.measureIndex, selectedCell.beatIndex, chord);
    }
  };

  const clearCell = () => {
    if (selectedCell) {
      updateCell(selectedCell.measureIndex, selectedCell.beatIndex, null);
    }
  };

  const handleAddMeasure = () => {
    const updatedSection = addMeasureToSection(section);
    onUpdateSection(updatedSection);
  };

  const handleRemoveMeasure = (measureIndex: number) => {
    const updatedSection = removeMeasureFromSection(section, measureIndex);
    onUpdateSection(updatedSection);
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

  const isCurrentBeat = (measureIndex: number, beatIndex: number) => {
    return currentBeat?.sectionIndex === sectionIndex &&
           currentBeat?.measureIndex === measureIndex &&
           currentBeat?.beatIndex === beatIndex;
  };

  const isSelected = (measureIndex: number, beatIndex: number) => {
    return selectedCell?.measureIndex === measureIndex &&
           selectedCell?.beatIndex === beatIndex;
  };

  const sectionColor = SECTION_COLORS[section.type];

  return (
    <div className="section-grid" style={{ borderLeftColor: sectionColor }}>
      <SectionHeader
        section={section}
        onUpdateSection={onUpdateSection}
        onDuplicate={onDuplicateSection}
        onDelete={onDeleteSection}
        canDelete={canDelete}
      />

      <div className="measures-container">
        {section.measures.map((measure, measureIndex) => (
          <div key={measureIndex} className="measure">
            <div className="measure-header">
              <span className="measure-number">{measureIndex + 1}</span>
              {section.measures.length > 1 && (
                <button
                  className="remove-measure-btn"
                  onClick={() => handleRemoveMeasure(measureIndex)}
                  title="Remove measure"
                >
                  ×
                </button>
              )}
            </div>

            <div className="measure-cells">
              {measure.map((cell, beatIndex) => (
                <div
                  key={beatIndex}
                  className={`chord-cell ${isSelected(measureIndex, beatIndex) ? 'selected' : ''} ${isCurrentBeat(measureIndex, beatIndex) ? 'playing' : ''}`}
                  onClick={() => handleCellClick(measureIndex, beatIndex)}
                >
                  {renderChord(cell.chord)}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="add-measure-btn" onClick={handleAddMeasure}>
          + Add Measure
        </button>
      </div>

      {selectedCell && (
        <div className="inspector-panel">
          <h3>Inspector</h3>
          <div className="inspector-cell-info">
            <span className="inspector-label">Section:</span>
            <span>{section.name}</span>
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
                    const currentDegree = section.measures[selectedCell.measureIndex][selectedCell.beatIndex].chord?.degree || 1;
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
