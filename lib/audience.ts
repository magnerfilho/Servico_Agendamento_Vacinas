import type { SubjectKind } from '@/lib/constants';

export function parseAudience(value: string | string[] | undefined): SubjectKind | null {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === 'person' || raw === 'pet') {
        return raw;
    }

    return null;
}

export function withAudience({ path, audience }: { path: string; audience: SubjectKind | null }): string {
    if (!audience) {
        return path;
    }

    return `${path}?audience=${audience}`;
}

export function audienceLabel(audience: SubjectKind): string {
    return audience === 'person' ? 'Pessoas' : 'Pets';
}
