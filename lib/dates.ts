import { APP_TIME_ZONE } from '@/lib/constants';

const ISO_DATE_LENGTH = 10;
const MONTH_INDEX_OFFSET = 1;

export function todayInAppTimeZone(now: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIME_ZONE }).format(now);
}

export function formatDateBr(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) {
        return isoDate;
    }

    return `${day}/${month}/${year}`;
}

export function subtractDays({ isoDate, days }: { isoDate: string; days: number }): string {
    const parts = isoDate.split('-').map((part) => Number(part));
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    if (!year || !month || !day) {
        return isoDate;
    }

    const utcDate = new Date(Date.UTC(year, month - MONTH_INDEX_OFFSET, day));
    utcDate.setUTCDate(utcDate.getUTCDate() - days);
    return utcDate.toISOString().slice(0, ISO_DATE_LENGTH);
}

export function parseDueDate(value: string): string | null {
    const trimmed = value.trim();
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    const brMatch = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(trimmed);

    if (isoMatch) {
        return calendarDate({
            year: Number(isoMatch[1]),
            month: Number(isoMatch[2]),
            day: Number(isoMatch[3]),
        });
    }

    if (brMatch) {
        return calendarDate({
            year: Number(brMatch[3]),
            month: Number(brMatch[2]),
            day: Number(brMatch[1]),
        });
    }

    return null;
}

function calendarDate({ year, month, day }: { year: number; month: number; day: number }): string | null {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return null;
    }

    const utcDate = new Date(Date.UTC(year, month - MONTH_INDEX_OFFSET, day));
    const matchesCalendar =
        utcDate.getUTCFullYear() === year &&
        utcDate.getUTCMonth() === month - MONTH_INDEX_OFFSET &&
        utcDate.getUTCDate() === day;

    if (!matchesCalendar) {
        return null;
    }

    return utcDate.toISOString().slice(0, ISO_DATE_LENGTH);
}

export function isSameAppDay({ isoTimestamp, today }: { isoTimestamp: string; today: string }): boolean {
    const parsed = new Date(isoTimestamp);
    if (Number.isNaN(parsed.getTime())) {
        return false;
    }

    return todayInAppTimeZone(parsed) === today;
}
