import { useState } from 'react';
import { Song } from '../types/music';
import { getSavedSongsList, loadSongFromStorage, deleteSongFromStorage, createEmptySong } from '../utils/songHelpers';

interface ProjectManagerProps {
  currentSong: Song;
  onLoadSong: (song: Song) => void;
  onNewSong: () => void;
}

export default function ProjectManager({ currentSong, onLoadSong, onNewSong }: ProjectManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedSongs, setSavedSongs] = useState(getSavedSongsList());

  const refreshSongsList = () => {
    setSavedSongs(getSavedSongsList());
  };

  const handleLoadSong = (songId: string) => {
    const song = loadSongFromStorage(songId);
    if (song) {
      onLoadSong(song);
      setIsOpen(false);
    }
  };

  const handleDeleteSong = (songId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this song?')) {
      deleteSongFromStorage(songId);
      refreshSongsList();
    }
  };

  const handleNewSong = () => {
    if (confirm('Create a new song? Any unsaved changes will be lost.')) {
      onNewSong();
      setIsOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="project-manager">
      <button
        className="project-manager-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Project Manager"
      >
        📁 {currentSong.title}
      </button>

      {isOpen && (
        <>
          <div className="project-manager-overlay" onClick={() => setIsOpen(false)} />
          <div className="project-manager-panel">
            <div className="project-manager-header">
              <h2>Project Manager</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className="project-manager-actions">
              <button className="action-btn new-song-btn" onClick={handleNewSong}>
                + New Song
              </button>
            </div>

            <div className="project-manager-list">
              <h3>Saved Songs</h3>
              {savedSongs.length === 0 ? (
                <p className="no-songs">No saved songs yet. Create a new song to get started!</p>
              ) : (
                <div className="songs-list">
                  {savedSongs.map((song) => (
                    <div
                      key={song.id}
                      className={`song-item ${song.id === currentSong.id ? 'current' : ''}`}
                      onClick={() => handleLoadSong(song.id)}
                    >
                      <div className="song-item-info">
                        <div className="song-item-title">{song.title}</div>
                        <div className="song-item-date">{formatDate(song.updatedAt)}</div>
                      </div>
                      <button
                        className="song-item-delete"
                        onClick={(e) => handleDeleteSong(song.id, e)}
                        title="Delete song"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
