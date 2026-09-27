import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import type { SchedulePayload } from '../types';

interface AddQuestionProps {
  onAdd: (url: string, title: string, schedule: SchedulePayload) => void;
  onComplete: () => void;
}

export default function AddQuestion({ onAdd, onComplete }: AddQuestionProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [scheduleType, setScheduleType] = useState<'standard' | 'custom-days' | 'custom-dates'>('standard');
  const [customDays, setCustomDays] = useState<string[]>(['1', '3', '7']);
  const [customDates, setCustomDates] = useState<string[]>(['']);

  const extractTitleFromUrl = (urlStr: string): string => {
    try {
      const parsedUrl = new URL(urlStr);
      if (!parsedUrl.hostname.includes('leetcode.com')) return '';
      
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      const problemsIndex = pathParts.indexOf('problems');
      
      if (problemsIndex !== -1 && pathParts.length > problemsIndex + 1) {
        const slug = pathParts[problemsIndex + 1];
        // Convert slug-to-title format: valid-parentheses -> Valid Parentheses
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    } catch (e) {
      // invalid URL
    }
    return '';
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    setError('');
    
    if (val) {
      const extracted = extractTitleFromUrl(val);
      if (extracted) {
        setTitle(extracted);
        setShowTitleInput(true);
      } else {
        setShowTitleInput(true);
      }
    } else {
      setShowTitleInput(false);
      setTitle('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for the problem');
      return;
    }

    let payload: SchedulePayload = { type: 'standard', days: [1, 4, 7] };
    if (scheduleType === 'custom-days') {
      const parsedDays = customDays.map(d => parseInt(d, 10)).filter(d => !isNaN(d) && d > 0);
      const finalDays = Array.from(new Set(parsedDays)).sort((a, b) => a - b);
      if (finalDays.length === 0) {
        setError('Please add at least one valid revision day.');
        return;
      }
      payload = { type: 'custom-days', days: finalDays };
    } else if (scheduleType === 'custom-dates') {
      const finalDates = Array.from(new Set(customDates.filter(d => d.trim() !== ''))).sort((a, b) => a.localeCompare(b));
      if (finalDates.length === 0) {
        setError('Please add at least one valid revision date.');
        return;
      }
      payload = { type: 'custom-dates', dates: finalDates };
    }

    try {
      onAdd(url.trim(), title.trim(), payload);
      setUrl('');
      setTitle('');
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to add problem');
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
      <h3 className="font-semibold text-zinc-900 mb-4">Add a new problem</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-zinc-700 mb-1">
            Problem URL
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://leetcode.com/problems/two-sum/"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
            value={url}
            onChange={handleUrlChange}
            required
          />
        </div>

        {showTitleInput && (
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
              Problem Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Two Sum"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-3 pt-2">
          <label className="block text-sm font-medium text-zinc-700">Schedule</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4 mb-3">
            <label className="flex items-center space-x-2">
              <input type="radio" checked={scheduleType === 'standard'} onChange={() => setScheduleType('standard')} className="text-zinc-900 focus:ring-zinc-900" />
              <span className="text-sm text-zinc-700">Standard (1, 4, 7 days)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" checked={scheduleType === 'custom-days'} onChange={() => setScheduleType('custom-days')} className="text-zinc-900 focus:ring-zinc-900" />
              <span className="text-sm text-zinc-700">Days after adding</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" checked={scheduleType === 'custom-dates'} onChange={() => setScheduleType('custom-dates')} className="text-zinc-900 focus:ring-zinc-900" />
              <span className="text-sm text-zinc-700">Specific dates</span>
            </label>
          </div>

          {scheduleType === 'custom-days' && (
            <div className="pl-6 space-y-2 mt-2">
              {customDays.map((day, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-sm text-zinc-500 w-20">Revision {idx + 1}</span>
                  <input
                    type="number"
                    min="1"
                    className="w-20 px-2 py-1 border border-zinc-300 rounded text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    value={day}
                    onChange={(e) => {
                      const newDays = [...customDays];
                      newDays[idx] = e.target.value;
                      setCustomDays(newDays);
                    }}
                  />
                  <span className="text-sm text-zinc-500">days after adding</span>
                  <button type="button" onClick={() => setCustomDays(customDays.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCustomDays([...customDays, ''])}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add revision</span>
              </button>
            </div>
          )}

          {scheduleType === 'custom-dates' && (
            <div className="pl-6 space-y-2 mt-2">
              {customDates.map((date, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-sm text-zinc-500 w-20">Revision {idx + 1}</span>
                  <input
                    type="date"
                    className="px-2 py-1 border border-zinc-300 rounded text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    value={date}
                    onChange={(e) => {
                      const newDates = [...customDates];
                      newDates[idx] = e.target.value;
                      setCustomDates(newDates);
                    }}
                  />
                  <button type="button" onClick={() => setCustomDates(customDates.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCustomDates([...customDates, ''])}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add date</span>
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Add to Tracker
          </button>
        </div>
      </form>
    </div>
  );
}
