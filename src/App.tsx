import { useState, useEffect } from 'react';
import { Home, History as HistoryIcon, Flame, ListTodo, CheckCircle2, Hash, LogOut } from 'lucide-react';
import { api } from './api';
import type { Problem, SchedulePayload } from './types';
import { getTodayStr, isPastOrToday, calculateStreak } from './utils/dateUtils';
import HomeView from './components/HomeView';
import HistoryView from './components/HistoryView';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'history'>('home');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadData();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadData();
      } else {
        setProblems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getProblems();
      setProblems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async (url: string, title: string, schedule: SchedulePayload) => {
    await api.addProblem(url, title, schedule);
    await loadData();
  };

  const handleMarkDone = async (_problemId: string, revisionId: string) => {
    await api.markRevisionDone(revisionId);
    await loadData();
  };

  const handleManualRevise = async (problemId: string) => {
    await api.addManualRevision(problemId);
    await loadData();
    setCurrentTab('home');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500">Loading...</div>;
  }

  if (!session) {
    return <Auth onLogin={loadData} />;
  }

  // Compute stats
  const allCompletedDates = problems.flatMap(p => 
    p.revisions.filter(r => r.completed && r.completedDate).map(r => r.completedDate!)
  );
  
  const streak = calculateStreak(allCompletedDates);
  
  const todayStr = getTodayStr();
  const dueRevisionsCount = problems.flatMap(p => 
    p.revisions.filter(r => !r.completed && isPastOrToday(r.dueDate))
  ).length;

  const doneTodayCount = problems.flatMap(p => 
    p.revisions.filter(r => r.completed && r.completedDate === todayStr)
  ).length;

  const totalQuestions = problems.length;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Revise</h1>
            <p className="text-xs text-zinc-500 font-medium">Your LeetCode revision tracker</p>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-1 items-center">
            <button 
              onClick={() => setCurrentTab('home')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'home' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'history' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
            >
              History
            </button>
            <div className="w-px h-6 bg-zinc-200 mx-2"></div>
            <button 
              onClick={handleSignOut}
              className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>

          <div className="md:hidden flex items-center">
             <button 
              onClick={handleSignOut}
              className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2 text-orange-500 mb-1">
              <Flame className="w-5 h-5" />
              <span className="font-semibold text-lg">{streak}</span>
            </div>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Day Streak</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2 text-red-500 mb-1">
              <ListTodo className="w-5 h-5" />
              <span className="font-semibold text-lg">{dueRevisionsCount}</span>
            </div>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Due</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2 text-green-500 mb-1">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-lg">{doneTodayCount}</span>
            </div>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Done Today</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2 text-blue-500 mb-1">
              <Hash className="w-5 h-5" />
              <span className="font-semibold text-lg">{totalQuestions}</span>
            </div>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total</span>
          </div>
        </div>

        {currentTab === 'home' ? (
          <HomeView 
            problems={problems} 
            onMarkDone={handleMarkDone}
            onAddProblem={handleAddProblem}
          />
        ) : (
          <HistoryView 
            problems={problems}
            onManualRevise={handleManualRevise}
          />
        )}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex pb-safe">
        <button 
          onClick={() => setCurrentTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${currentTab === 'home' ? 'text-zinc-900' : 'text-zinc-500'}`}
        >
          <Home className={`w-5 h-5 mb-1 ${currentTab === 'home' ? 'text-zinc-900' : 'text-zinc-400'}`} />
          Home
        </button>
        <button 
          onClick={() => setCurrentTab('history')}
          className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${currentTab === 'history' ? 'text-zinc-900' : 'text-zinc-500'}`}
        >
          <HistoryIcon className={`w-5 h-5 mb-1 ${currentTab === 'history' ? 'text-zinc-900' : 'text-zinc-400'}`} />
          History
        </button>
      </nav>
    </div>
  );
}

export default App;
