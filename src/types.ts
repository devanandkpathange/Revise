export type RevisionType = 'scheduled' | 'manual' | '1-day' | '4-day' | '7-day';

export interface Revision {
  id: string;
  type: RevisionType;
  revisionDay: number | null;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedDate?: string; // YYYY-MM-DD
}

export interface Problem {
  id: string;
  title: string;
  url: string;
  dateAdded: string; // YYYY-MM-DD
  scheduleDays: number[];
  scheduleDates?: string[] | null;
  revisions: Revision[];
}

export interface SchedulePayload {
  type: 'standard' | 'custom-days' | 'custom-dates';
  days?: number[];
  dates?: string[];
}
