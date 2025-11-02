import { Note, NOTES } from '../types/music';

interface KeySelectorProps {
  selectedKey: Note;
  onKeyChange: (key: Note) => void;
}

export default function KeySelector({ selectedKey, onKeyChange }: KeySelectorProps) {
  return (
    <div className="key-selector">
      <label htmlFor="key-select">Song Key:</label>
      <select
        id="key-select"
        value={selectedKey}
        onChange={(e) => onKeyChange(e.target.value as Note)}
      >
        {NOTES.map((note) => (
          <option key={note} value={note}>
            {note}
          </option>
        ))}
      </select>
    </div>
  );
}
