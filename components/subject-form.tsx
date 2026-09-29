'use client';

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';
import { createSubject } from '@/lib/actions/subjects';
import { emptyFormState } from '@/lib/actions/form-state';
import { FormNotice } from '@/components/form-notice';
import { SubmitButton } from '@/components/submit-button';
import type { SubjectKind } from '@/lib/constants';

interface GuardianOption {
    id: string;
    name: string;
}

export function SubjectForm({
    guardians,
    audience,
}: {
    guardians: GuardianOption[];
    audience: SubjectKind | null;
}): ReactElement {
    const [state, action] = useActionState(createSubject, emptyFormState);
    const [kind, setKind] = useState<SubjectKind>(audience ?? 'person');

    return (
        <form key={state.savedAt ?? 'new'} action={action}>
            <FormNotice state={state} />
            <label>
                Responsável
                <select name="guardianId" required defaultValue="">
                    <option value="" disabled>
                        Escolha
                    </option>
                    {guardians.map((guardian) => (
                        <option key={guardian.id} value={guardian.id}>
                            {guardian.name}
                        </option>
                    ))}
                </select>
            </label>
            {audience ? (
                <input type="hidden" name="kind" value={audience} />
            ) : (
                <label>
                    Tipo
                    <select
                        name="kind"
                        value={kind}
                        onChange={(event) => {
                            const nextKind = event.target.value === 'pet' ? 'pet' : 'person';
                            setKind(nextKind);
                        }}
                    >
                        <option value="person">Pessoa</option>
                        <option value="pet">Pet</option>
                    </select>
                </label>
            )}
            <label>
                Nome
                <input name="name" required />
            </label>
            {kind === 'pet' ? (
                <label>
                    Espécie
                    <input name="species" placeholder="cão, gato" required />
                </label>
            ) : null}
            <SubmitButton label="Salvar" />
        </form>
    );
}
