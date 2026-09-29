'use client';

import { useActionState } from 'react';
import type { ReactElement } from 'react';
import { createGuardian } from '@/lib/actions/guardians';
import { emptyFormState } from '@/lib/actions/form-state';
import { FormNotice } from '@/components/form-notice';
import { SubmitButton } from '@/components/submit-button';

export function GuardianForm(): ReactElement {
    const [state, action] = useActionState(createGuardian, emptyFormState);

    return (
        <form key={state.savedAt ?? 'new'} action={action}>
            <FormNotice state={state} />
            <label>
                Nome
                <input name="name" autoComplete="name" required />
            </label>
            <label>
                WhatsApp com DDI
                <input name="whatsappNumber" inputMode="numeric" placeholder="5511999999999" required />
            </label>
            <SubmitButton label="Salvar responsável" />
        </form>
    );
}
