import { Section, SectionType, SECTION_TYPES, SECTION_COLORS } from '../types/music';

interface SectionHeaderProps {
  section: Section;
  onUpdateSection: (section: Section) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export default function SectionHeader({
  section,
  onUpdateSection,
  onDuplicate,
  onDelete,
  canDelete
}: SectionHeaderProps) {
  const handleTypeChange = (type: SectionType) => {
    onUpdateSection({
      ...section,
      type,
      name: `${type} 1` // Auto-update name when type changes
    });
  };

  const handleNameChange = (name: string) => {
    onUpdateSection({
      ...section,
      name
    });
  };

  const handleLyricsChange = (lyrics: string) => {
    onUpdateSection({
      ...section,
      lyrics
    });
  };

  const sectionColor = SECTION_COLORS[section.type];

  return (
    <div className="section-header" style={{ borderLeftColor: sectionColor }}>
      <div className="section-header-top">
        <div className="section-info">
          <select
            className="section-type-select"
            value={section.type}
            onChange={(e) => handleTypeChange(e.target.value as SectionType)}
            style={{ color: sectionColor }}
          >
            {SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="section-name-input"
            value={section.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Section name"
          />
        </div>

        <div className="section-actions">
          <button
            className="section-action-btn duplicate-btn"
            onClick={onDuplicate}
            title="Duplicate section"
          >
            ⎘
          </button>
          <button
            className="section-action-btn delete-btn"
            onClick={onDelete}
            disabled={!canDelete}
            title="Delete section"
          >
            ×
          </button>
        </div>
      </div>

      <div className="section-lyrics">
        <textarea
          className="lyrics-input"
          value={section.lyrics}
          onChange={(e) => handleLyricsChange(e.target.value)}
          placeholder="Lyrics for this section..."
          rows={3}
        />
      </div>
    </div>
  );
}
