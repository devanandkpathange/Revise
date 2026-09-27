import { useState } from 'react';
import type { Problem, SchedulePayload } from '../types';
import { isPastOrToday } from '../utils/dateUtils';
import QuestionCard from './QuestionCard';
import AddQuestion from './AddQuestion';

interface HomeViewProps {
  problems: Problem[];
  onMarkDone: (problemId: string, revisionId: string) => void;
  onAddProblem: (url: string, title: string, schedule: SchedulePayload) => void;
}

export default function HomeView({ problems, onMarkDone, onAddProblem }: HomeViewProps) {
  const [showAdd, setShowAdd] = useState(false);

  // Get all due revisions
  const dueItems = problems.flatMap(p => 
    p.revisions
      .filter(r => !r.completed && isPastOrToday(r.dueDate))
      .map(r => ({ problem: p, revision: r }))
  ).sort((a, b) => a.revision.dueDate.localeCompare(b.revision.dueDate));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">Today's Revisions</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
        >
          {showAdd ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6">
          <AddQuestion onAdd={onAddProblem} onComplete={() => setShowAdd(false)} />
        </div>
      )}

      {dueItems.length > 0 ? (
        <div className="space-y-3">
          {dueItems.map(({ problem, revision }) => (
            <QuestionCard 
              key={revision.id}
              problem={problem}
              revision={revision}
              onMarkDone={() => onMarkDone(problem.id, revision.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center shadow-sm">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">You're caught up!</h3>
          <p className="text-zinc-500 text-sm">Nothing to revise today. Great job staying on track.</p>
        </div>
      )}
    </div>
  );
}
