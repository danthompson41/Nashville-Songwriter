interface TimelineProps {
  measures: number;
  beatsPerMeasure: number;
  currentBeat?: number;
}

export default function Timeline({ measures, beatsPerMeasure, currentBeat }: TimelineProps) {
  return (
    <div className="timeline">
      {Array.from({ length: measures }, (_, measureIdx) => (
        <div key={measureIdx} className="timeline-measure">
          <div className="measure-number">{measureIdx + 1}</div>
          <div className="beat-markers">
            {Array.from({ length: beatsPerMeasure }, (_, beatIdx) => {
              const absoluteBeat = measureIdx * beatsPerMeasure + beatIdx;
              const isCurrentBeat = currentBeat !== undefined && absoluteBeat === currentBeat;

              return (
                <div
                  key={beatIdx}
                  className={`beat-marker ${isCurrentBeat ? 'current-beat' : ''}`}
                  title={`${measureIdx + 1}.${beatIdx + 1}`}
                >
                  {beatIdx === 0 && <div className="beat-tick major" />}
                  {beatIdx !== 0 && <div className="beat-tick minor" />}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
