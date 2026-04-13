import { useState } from 'react';
import { ChevronLeft, Flame, Info, CheckCircle2, Rewind } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getExerciseById, getExerciseLogs, recommendProgression, getHistoricBestSet, getTopSet, calculateTotalVolume, formatShortDate } from '../engine/fitness';

export default function ExerciseDetails({ exerciseId, onBack }) {
  const { state, metrics, logWorkout } = useApp();

  const exercise = getExerciseById(exerciseId);
  const logs = getExerciseLogs(state.workoutLogs, exerciseId);
  const profile = state.profile;

  if (!exercise || !profile || !metrics) return null;

  const progression = recommendProgression(profile, metrics, exercise, state.workoutLogs);
  const lastLog = logs[0];
  const lastTopSet = getTopSet(lastLog);
  const prSet = getHistoricBestSet(state.workoutLogs, exerciseId);

  const defaultReps = lastTopSet ? lastTopSet.reps : parseInt(exercise.defaultRepRange.split('-')[0]) || 10;
  const defaultWeight = progression.recommendedWeightKg || 0;

  const [inputSets, setInputSets] = useState(3);
  const [inputReps, setInputReps] = useState(defaultReps);
  const [inputWeight, setInputWeight] = useState(defaultWeight);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const sets = Array.from({ length: inputSets }).map((_, i) => ({
      setNumber: i + 1,
      reps: inputReps,
      weightKg: inputWeight,
      restSeconds: exercise.restSeconds,
      durationSeconds: 0
    }));

    logWorkout({
      exerciseId,
      exerciseName: exercise.name,
      sets,
      date: new Date().toISOString()
    });

    setSaved(true);
    setTimeout(() => onBack(), 800);
  };

  const actionColor =
    progression.action === 'reduce' ? 'border-red-500/20 bg-red-500/5' :
    progression.action === 'hold' ? 'border-white/[0.06] bg-white/[0.03]' :
    'border-green-500/20 bg-green-500/5';

  return (
    <div className="px-5 pt-14 pb-24 space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Back Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Exercises</span>
        </button>
        <span className="text-xs font-semibold text-energy tracking-widest uppercase">{exercise.category}</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">{exercise.name}</h1>
        <p className="text-xs text-white/40 mt-1">
          Target: <span className="text-white/60 capitalize">{exercise.targetMuscle}</span>
          {' · '}Rep Range: <span className="text-white/60">{exercise.defaultRepRange}</span>
          {' · '}Rest: <span className="text-white/60">{exercise.restSeconds}s</span>
        </p>
      </div>

      {/* Last vs PR */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-cyan-400/50" />
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-2">Last Session</p>
          {lastLog && lastTopSet ? (
            <>
              <p className="text-xl font-bold text-white">{lastTopSet.weightKg} kg</p>
              <p className="text-xs text-white/50 mt-1">{lastLog.sets.length} sets × {lastTopSet.reps} reps</p>
              <p className="text-[10px] text-white/30 mt-0.5">{formatShortDate(lastLog.date)}</p>
            </>
          ) : (
            <p className="text-sm text-white/30 mt-2">No history yet</p>
          )}
        </div>

        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full rounded-r-2xl bg-amber-400/60" />
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-2">Best Ever (PR)</p>
          {prSet ? (
            <>
              <div className="flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400" />
                <p className="text-xl font-bold text-amber-400">{prSet.weightKg} kg</p>
              </div>
              <p className="text-xs text-white/50 mt-1">Record: {prSet.reps} reps</p>
              <p className="text-[10px] text-white/30 mt-0.5">{formatShortDate(prSet.date)}</p>
            </>
          ) : (
            <p className="text-sm text-white/30 mt-2">Set your first PR</p>
          )}
        </div>
      </div>

      {/* Progression Advice */}
      <div className={'p-4 rounded-2xl border ' + actionColor}>
        <div className="flex items-start gap-2 mb-2">
          {progression.action === 'reduce'
            ? <Rewind size={15} className="text-red-400 shrink-0 mt-0.5" />
            : <Info size={15} className="text-cyan-400 shrink-0 mt-0.5" />
          }
          <p className="text-sm font-semibold text-white leading-snug">{progression.summary}</p>
        </div>
        <p className="text-xs text-white/40 leading-relaxed pl-5">{progression.reasoning.join(' ')}</p>
        {progression.warnings.length > 0 && (
          <div className="mt-2.5 space-y-1 pl-5">
            {progression.warnings.map((w, i) => (
              <p key={i} className="text-[11px] text-red-400">{w}</p>
            ))}
          </div>
        )}
      </div>

      {/* Log Form */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Log Today</h3>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Sets', value: inputSets, min: 1, max: 20, setter: setInputSets },
            { label: 'Reps', value: inputReps, min: 1, max: 100, setter: setInputReps },
            { label: 'Weight (kg)', value: inputWeight, min: 0, max: 500, setter: setInputWeight },
          ].map(({ label, value, min, max, setter }) => (
            <div key={label}>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">{label}</label>
              <input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl p-3 text-center text-white font-bold text-lg outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-400 text-gray-900 font-bold text-sm transition-all hover:bg-cyan-300 active:scale-[0.98] disabled:opacity-70"
        >
          <CheckCircle2 size={18} />
          {saved ? 'Saved!' : 'Save Session'}
        </button>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Session History</h3>
          <div className="space-y-2">
            {logs.map((log) => {
              const top = getTopSet(log);
              const vol = calculateTotalVolume(log);
              return (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <div>
                    <p className="text-xs font-semibold text-white">{formatShortDate(log.date)}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{log.sets.length} sets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">
                      {top ? top.weightKg + ' kg × ' + top.reps : '—'}
                    </p>
                    <p className="text-[10px] text-white/40">vol {vol} kg</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How to Perform */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">How to perform</h3>
        <ul className="space-y-2">
          {exercise.instructions.map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="text-[10px] font-bold text-cyan-400/60 mt-0.5">{i + 1}</span>
              <p className="text-xs text-white/50 leading-relaxed">{step}</p>
            </li>
          ))}
        </ul>
        {exercise.youtubeUrl && (
          <a
            href={exercise.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/15 transition-all"
          >
            <span>▶</span>
            Watch tutorial on YouTube
          </a>
        )}
      </div>
    </div>
  );
}
