import { useState, useRef, useEffect } from 'react';
import { AudioEngine } from '../utils/audioEngine';
import { Note, Song } from '../types/music';

interface AudioPreviewProps {
  song: Song;
  onPlaybackPosition?: (position: { sectionIndex: number; measureIndex: number; beatIndex: number }) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onPausedChange?: (isPaused: boolean) => void;
}

export default function AudioPreview({
  song,
  onPlaybackPosition,
  onPlayingChange,
  onPausedChange
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ sectionIndex: number; measureIndex: number; beatIndex: number } | null>(null);
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const playbackTimerRef = useRef<number | null>(null);
  const pausePositionRef = useRef<{ sectionIndex: number; measureIndex: number; beatIndex: number }>({ sectionIndex: 0, measureIndex: 0, beatIndex: 0 });

  useEffect(() => {
    if (onPlayingChange) onPlayingChange(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    if (onPausedChange) onPausedChange(isPaused);
  }, [isPaused, onPausedChange]);

  useEffect(() => {
    if (onPlaybackPosition && currentPosition) onPlaybackPosition(currentPosition);
  }, [currentPosition, onPlaybackPosition]);

  const handlePlay = async () => {
    if (isPlaying && !isPaused) return;

    if (song.sections.length === 0) {
      alert('No sections to play! Add a section first.');
      return;
    }

    const startPosition = isPaused ? pausePositionRef.current : { sectionIndex: 0, measureIndex: 0, beatIndex: 0 };
    setIsPlaying(true);
    setIsPaused(false);

    const beatDuration = (60 / song.tempo) * 1000; // ms per beat

    let { sectionIndex, measureIndex, beatIndex } = startPosition;

    const playNextBeat = () => {
      // Check if we've reached the end
      if (sectionIndex >= song.sections.length) {
        handleStop();
        return;
      }

      const section = song.sections[sectionIndex];

      if (measureIndex >= section.measures.length) {
        // Move to next section
        sectionIndex++;
        measureIndex = 0;
        beatIndex = 0;
        playNextBeat();
        return;
      }

      const measure = section.measures[measureIndex];

      if (beatIndex >= measure.length) {
        // Move to next measure
        measureIndex++;
        beatIndex = 0;
        playNextBeat();
        return;
      }

      // Play current beat
      const cell = measure[beatIndex];
      const position = { sectionIndex, measureIndex, beatIndex };
      setCurrentPosition(position);

      if (cell.chord) {
        audioEngineRef.current.playChord(cell.chord, song.key, cell.duration * (60 / song.tempo));
      }

      // Move to next beat
      beatIndex++;
      playbackTimerRef.current = setTimeout(playNextBeat, beatDuration * (cell.duration || 1));
    };

    playNextBeat();
  };

  const handlePause = () => {
    if (!isPlaying) return;

    setIsPaused(true);
    setIsPlaying(false);
    if (currentPosition) {
      pausePositionRef.current = currentPosition;
    }

    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(null);
    pausePositionRef.current = { sectionIndex: 0, measureIndex: 0, beatIndex: 0 };

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
    currentPosition,
    handlePlay,
    handlePause,
    handleStop
  };
}
