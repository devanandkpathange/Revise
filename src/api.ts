import { supabase } from './lib/supabase';
import type { Problem, RevisionType, SchedulePayload } from './types';
import { getTodayStr, addDaysToStr } from './utils/dateUtils';

export const api = {
  getProblems: async (): Promise<Problem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: problemsData, error: pError } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (pError) throw pError;

    const { data: revisionsData, error: rError } = await supabase
      .from('revisions')
      .select('*');

    if (rError) throw rError;

    // Merge revisions into problems
    const problems: Problem[] = problemsData.map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      dateAdded: p.date_added,
      scheduleDays: p.schedule_days || [1, 4, 7],
      scheduleDates: p.schedule_dates,
      revisions: revisionsData
        .filter(r => r.problem_id === p.id)
        .map(r => ({
          id: r.id,
          type: r.revision_type as RevisionType,
          revisionDay: r.revision_day,
          dueDate: r.due_date,
          completed: r.completed,
          completedDate: r.completed_date
        }))
    }));

    return problems;
  },

  addProblem: async (url: string, title: string, schedule: SchedulePayload = { type: 'standard', days: [1, 4, 7] }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = getTodayStr();
    
    // Insert problem
    const { data: problem, error: pError } = await supabase
      .from('problems')
      .insert({
        user_id: user.id,
        title,
        url,
        date_added: today,
        schedule_days: schedule.type !== 'custom-dates' ? (schedule.days || [1, 4, 7]) : null,
        schedule_dates: schedule.type === 'custom-dates' ? schedule.dates : null
      })
      .select()
      .single();

    if (pError) {
      if (pError.code === '23505') { // unique violation
        throw new Error('Problem already exists in tracker.');
      }
      throw pError;
    }

    // Insert scheduled revisions
    let revisionsToInsert: any[] = [];
    if (schedule.type === 'custom-dates' && schedule.dates) {
      revisionsToInsert = schedule.dates.map(date => ({
        problem_id: problem.id,
        user_id: user.id,
        revision_type: 'scheduled',
        revision_day: null,
        due_date: date
      }));
    } else {
      const days = schedule.days || [1, 4, 7];
      revisionsToInsert = days.map(day => ({
        problem_id: problem.id,
        user_id: user.id,
        revision_type: 'scheduled',
        revision_day: day,
        due_date: addDaysToStr(today, day)
      }));
    }

    const { error: rError } = await supabase
      .from('revisions')
      .insert(revisionsToInsert);

    if (rError) throw rError;
  },

  markRevisionDone: async (revisionId: string) => {
    const today = getTodayStr();
    
    const { error } = await supabase
      .from('revisions')
      .update({
        completed: true,
        completed_date: today
      })
      .eq('id', revisionId);

    if (error) throw error;
  },

  addManualRevision: async (problemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const today = getTodayStr();

    const { error } = await supabase
      .from('revisions')
      .insert({
        problem_id: problemId,
        user_id: user.id,
        revision_type: 'manual',
        revision_day: null,
        due_date: today
      });

    if (error) throw error;
  }
};
