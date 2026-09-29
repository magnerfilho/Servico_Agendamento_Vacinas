'use client';

import type { ReactElement } from 'react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ label }: { label: string }): ReactElement {
    const { pending } = useFormStatus();

    return (
        <button type="submit" disabled={pending}>
            {pending ? 'Salvando...' : label}
        </button>
    );
}
