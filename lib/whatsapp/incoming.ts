import type { CareItemKind, SubjectKind } from '@/lib/constants';
import { careItemKinds, subjectKinds } from '@/lib/constants';

const SUBJECT_KIND_ALIASES: Record<string, SubjectKind> = {
    person: 'person',
    pessoa: 'person',
    pet: 'pet',
};

const CARE_ITEM_KIND_ALIASES: Record<string, CareItemKind> = {
    vaccine: 'vaccine',
    vacina: 'vaccine',
    medication: 'medication',
    medicamento: 'medication',
    remedio: 'medication',
};

export function readIncomingText(value: unknown): string {
    if (typeof value === 'string') {
        return cleanText(value);
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (!value || typeof value !== 'object') {
        return '';
    }

    const record = value as Record<string, unknown>;
    const buttonId = readNestedId(record);
    if (buttonId) {
        return buttonId;
    }

    const textBody = readNestedText(record);
    if (textBody) {
        return textBody;
    }

    return '';
}

export function parseSubjectKind(value: unknown): SubjectKind | null {
    const normalized = normalizeChoice(readIncomingText(value));
    const alias = SUBJECT_KIND_ALIASES[normalized];
    if (alias) {
        return alias;
    }

    return subjectKinds.find((kind) => kind === normalized) ?? null;
}

export function parseCareItemKind(value: unknown): CareItemKind | null {
    const normalized = normalizeChoice(readIncomingText(value));
    const alias = CARE_ITEM_KIND_ALIASES[normalized];
    if (alias) {
        return alias;
    }

    return careItemKinds.find((kind) => kind === normalized) ?? null;
}

function cleanText(value: string): string {
    const trimmed = value.trim();
    if (trimmed.includes('{{')) {
        return '';
    }

    return trimmed;
}

function normalizeChoice(value: string): string {
    return value
        .toLocaleLowerCase('pt-BR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function readNestedId(record: Record<string, unknown>): string {
    const direct = firstText(record.id, record.button_id, record.buttonId, record.list_id, record.listId);
    if (direct) {
        return direct;
    }

    const interactive = asRecord(record.interactive);
    const buttonReply = asRecord(interactive?.button_reply) ?? asRecord(record.button_reply);
    const listReply = asRecord(interactive?.list_reply) ?? asRecord(record.list_reply);
    return firstText(buttonReply?.id, listReply?.id);
}

function readNestedText(record: Record<string, unknown>): string {
    const text = asRecord(record.text);
    return firstText(text?.body, record.body, record.title, record.value);
}

function firstText(...values: unknown[]): string {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return cleanText(value);
        }
    }

    return '';
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    return value as Record<string, unknown>;
}
