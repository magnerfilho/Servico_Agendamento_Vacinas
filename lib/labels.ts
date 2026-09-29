import type { CareItemKind, CareItemStatus, SubjectKind } from '@/lib/constants';

export function subjectKindLabel(kind: SubjectKind): string {
    return kind === 'person' ? 'Pessoa' : 'Pet';
}

export function careItemKindLabel(kind: CareItemKind): string {
    return kind === 'vaccine' ? 'Vacina' : 'Medicamento';
}

export function careItemStatusLabel(status: CareItemStatus): string {
    return status === 'pending' ? 'Pendente' : 'Lembrete enviado';
}
