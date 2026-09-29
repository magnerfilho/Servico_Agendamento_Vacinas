'use client';

import { useActionState } from 'react';
import type { ReactElement } from 'react';
import { createCareItem } from '@/lib/actions/items';
import { emptyFormState } from '@/lib/actions/form-state';
import { DEFAULT_REMIND_DAYS_BEFORE } from '@/lib/constants';
import { FormNotice } from '@/components/form-notice';
import { SubmitButton } from '@/components/submit-button';

interface SubjectOption {
    id: string;
    label: string;
}

export function ItemForm({ subjects }: { subjects: SubjectOption[] }): ReactElement {
    const [state, action] = useActionState(createCareItem, emptyFormState);

    return (
        <form key={state.savedAt ?? 'new'} action={action}>
            <FormNotice state={state} />
            <label>
                Pessoa ou pet
                <select name="subjectId" required defaultValue="">
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
            <SubmitButton label="Salvar lembrete" />
        </form>
    );
}
