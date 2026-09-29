import type { ReactElement } from 'react';
import type { FormState } from '@/lib/actions/form-state';

export function FormNotice({ state }: { state: FormState }): ReactElement | null {
    if (state.error) {
        return (
            <p className="form-error" role="alert">
                {state.error}
            </p>
        );
    }

    if (state.savedAt) {
        return <p className="form-success">Cadastro salvo.</p>;
    }

    return null;
}
