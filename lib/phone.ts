import { MAX_PHONE_DIGITS, MIN_PHONE_DIGITS } from '@/lib/constants';

export function normalizePhone(value: string): string {
    return value.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
    return value.length >= MIN_PHONE_DIGITS && value.length <= MAX_PHONE_DIGITS;
}

export function formatPhone(digits: string): string {
    return `+${digits}`;
}
