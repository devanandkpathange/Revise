import { ExternalLink, Check } from 'lucide-react';
import type { Problem, Revision } from '../types';
import { format, parseISO } from 'date-fns';

interface QuestionCardProps {
  problem: Problem;
  revision: Revision;
  onMarkDone: () => void;
}

export default function QuestionCard({ problem, revision, onMarkDone }: QuestionCardProps) {
  const getRevisionLabel = (rev: Revision) => {
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

  const formattedDate = format(parseISO(revision.dueDate), 'MMM d, yyyy');

  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-300">
      <div className="flex flex-col">
        <h3 className="font-semibold text-zinc-900 text-lg line-clamp-1">{problem.title}</h3>
        <p className="text-sm text-zinc-500 mt-1">
          {getRevisionLabel(revision)} <span className="mx-1.5">&middot;</span> Due {formattedDate}
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
          onClick={onMarkDone}
          className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm"
        >
          <Check className="w-4 h-4" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
}
