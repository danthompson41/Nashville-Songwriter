import { useState, useRef, useEffect } from 'react';
import { AudioEngine } from '../utils/audioEngine';
import { Note, ChordCell } from '../types/music';

interface AudioPreviewProps {
  songKey: Note;
  grid: ChordCell[][];
  tempo: number;
  onTempoChange: (tempo: number) => void;
  onPlaybackPosition?: (beat: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onPausedChange?: (isPaused: boolean) => void;
}

export default function AudioPreview({
  songKey,
  grid,
  tempo,
  onTempoChange,
  onPlaybackPosition,
  onPlayingChange,
  onPausedChange
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const playbackTimerRef = useRef<number | null>(null);
  const pausePositionRef = useRef<number>(0);

  useEffect(() => {
    if (onPlayingChange) onPlayingChange(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    if (onPausedChange) onPausedChange(isPaused);
  }, [isPaused, onPausedChange]);

  useEffect(() => {
    if (onPlaybackPosition) onPlaybackPosition(currentBeat);
  }, [currentBeat, onPlaybackPosition]);

  const handlePlay = async () => {
    if (isPlaying && !isPaused) return;

    // Flatten the grid into a sequence of chords
    const sequence = grid.flat()
      .filter(cell => cell.chord !== null)
      .map(cell => ({
        chord: cell.chord!,
        duration: cell.duration
      }));

    if (sequence.length === 0) {
      alert('No chords to play! Add some chords to the grid first.');
      return;
    }

    const startBeat = isPaused ? pausePositionRef.current : 0;
    setIsPlaying(true);
    setIsPaused(false);

    const beatDuration = (60 / tempo) * 1000; // ms per beat

    // Play from start or resume position
    let beat = startBeat;

    const playNextChord = () => {
      if (beat >= sequence.length) {
        handleStop();
        return;
      }

      setCurrentBeat(beat);
      const { chord, duration } = sequence[beat];
      audioEngineRef.current.playChord(chord, songKey, duration * (60 / tempo));

      beat++;
      playbackTimerRef.current = setTimeout(playNextChord, beatDuration * duration);
    };

    playNextChord();
  };

  const handlePause = () => {
    if (!isPlaying) return;

    setIsPaused(true);
    setIsPlaying(false);
    pausePositionRef.current = currentBeat;

    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentBeat(0);
    pausePositionRef.current = 0;

    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    audioEngineRef.current.stop();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    currentBeat,
    handlePlay,
    handlePause,
    handleStop
  };
}
