import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function isOverdue(dueDateString: string, completed: boolean): boolean {
  if (completed) return false;
  try {
    const due = new Date(dueDateString);
    if (isNaN(due.getTime())) return false;
    const now = new Date();
    // If the due date string was just YYYY-MM-DD or T00:00:00, treat deadline as end of that day
    if (dueDateString.length === 10 || dueDateString.includes('T00:00:00')) {
      const dueEndOfDay = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 23, 59, 59, 999);
      return dueEndOfDay.getTime() < now.getTime();
    }
    return due.getTime() < now.getTime();
  } catch {
    return false;
  }
}

export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
