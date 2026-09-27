import { ExternalLink, RotateCcw } from 'lucide-react';
import type { Problem } from '../types';
import { format, parseISO } from 'date-fns';

interface HistoryViewProps {
  problems: Problem[];
  onManualRevise: (problemId: string) => void;
}

export default function HistoryView({ problems, onManualRevise }: HistoryViewProps) {
  // Get all completed revisions
  const historyItems = problems.flatMap(p => 
    p.revisions
      .filter(r => r.completed && r.completedDate)
      .map(r => ({ problem: p, revision: r }))
  ).sort((a, b) => b.revision.completedDate!.localeCompare(a.revision.completedDate!));

  const getRevisionLabel = (rev: any) => {
    if (rev.type === 'manual') return 'Manual';
    if (rev.type === 'scheduled' && rev.revisionDay) return `Revision +${rev.revisionDay} days`;
    if (rev.type === 'scheduled') return 'Scheduled Revision';
    switch (rev.type) {
      case '1-day': return 'Revision +1 days';
      case '4-day': return 'Revision +4 days';
      case '7-day': return 'Revision +7 days';
      default: return 'Revision';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-zinc-900">Revision History</h2>

      {historyItems.length > 0 ? (
        <div className="space-y-3">
          {historyItems.map(({ problem, revision }) => (
            <div 
              key={revision.id} 
              className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-300"
            >
              <div className="flex flex-col">
                <h3 className="font-semibold text-zinc-900 text-lg line-clamp-1">{problem.title}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {getRevisionLabel(revision)} <span className="mx-1.5">&middot;</span> Completed {format(parseISO(revision.completedDate!), 'MMM d, yyyy')}
                </p>
              </div>
              
              <div className="flex items-center space-x-3 sm:ml-auto">
                <a 
                  href={problem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => onManualRevise(problem.id)}
                  title="Revise Now (Create a Manual Revision)"
                  className="flex items-center justify-center p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center shadow-sm">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No history yet</h3>
          <p className="text-zinc-500 text-sm">Completed revisions will show up here.</p>
        </div>
      )}
    </div>
  );
}
