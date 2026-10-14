'use client';

import type { ReactElement } from 'react';
import { deleteSubject } from '@/lib/actions/subjects';

export function DeleteSubjectButton({ subjectId }: { subjectId: string }): ReactElement {
    return (
        <form
            action={deleteSubject}
            onSubmit={(event) => {
                if (!window.confirm('Excluir este cadastro e as vacinas ligadas a ele?')) {
                    event.preventDefault();
                }
            }}
        >
            <input type="hidden" name="subjectId" defaultValue={subjectId} />
            <button className="text-button" type="submit">
                Excluir
            </button>
        </form>
    );
}
