'use client';

import type { ReactElement } from 'react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({
    label,
    pendingLabel = 'Salvando...',
}: {
    label: string;
    pendingLabel?: string;
}): ReactElement {
    const { pending } = useFormStatus();

    return (
        <button type="submit" disabled={pending}>
            {pending ? pendingLabel : label}
        </button>
    );
}
