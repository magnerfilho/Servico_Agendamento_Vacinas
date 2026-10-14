'use client';

import { useActionState } from 'react';
import type { ReactElement } from 'react';
import { createCareItem } from '@/lib/actions/items';
import { emptyFormState } from '@/lib/actions/form-state';
import { DEFAULT_REMIND_DAYS_BEFORE, DEFAULT_REMIND_TIME, type SubjectKind } from '@/lib/constants';
import { FormNotice } from '@/components/form-notice';
import { SubmitButton } from '@/components/submit-button';

interface SubjectOption {
    id: string;
    label: string;
}

export function ItemForm({
    subjects,
    audience,
    selectedSubjectId,
}: {
    subjects: SubjectOption[];
    audience: SubjectKind | null;
    selectedSubjectId: string | null;
}): ReactElement {
    const [state, action] = useActionState(createCareItem, emptyFormState);
    const chosen = subjects.some((subject) => subject.id === selectedSubjectId) ? selectedSubjectId : '';

    return (
        <form key={`${state.savedAt ?? 'new'}-${chosen || 'none'}`} action={action}>
            <FormNotice state={state} />
            <label>
                {subjectFieldLabel(audience)}
                <select name="subjectId" required defaultValue={chosen ?? ''}>
                    <option value="" disabled>
                        Escolha
                    </option>
                    {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.label}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Tipo
                <select name="kind" defaultValue="vaccine">
                    <option value="vaccine">Vacina</option>
                    <option value="medication">Medicamento</option>
                </select>
            </label>
            <label>
                Nome
                <input name="name" required />
            </label>
            <label>
                Vencimento
                <input name="dueDate" type="date" required />
            </label>
            <label>
                Avisar com quantos dias de antecedência
                <input
                    name="remindDaysBefore"
                    type="number"
                    min={0}
                    defaultValue={DEFAULT_REMIND_DAYS_BEFORE}
                    required
                />
            </label>
            <label>
                Horário do alerta
                <input name="remindTime" type="time" defaultValue={DEFAULT_REMIND_TIME} required />
            </label>
            <SubmitButton label="Salvar lembrete" />
        </form>
    );
}

function subjectFieldLabel(audience: SubjectKind | null): string {
    if (audience === 'pet') {
        return 'Pet já cadastrado';
    }

    if (audience === 'person') {
        return 'Pessoa já cadastrada';
    }

    return 'Pessoa ou pet já cadastrado';
}
