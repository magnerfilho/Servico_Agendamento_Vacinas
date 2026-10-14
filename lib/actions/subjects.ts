'use server';

import { revalidatePath } from 'next/cache';
import { readGuardianSession } from '@/lib/auth/session';
import { deleteSubjectForGuardian, insertSubject } from '@/lib/db/queries';
import type { FormState } from '@/lib/actions/form-state';
import { parseSubjectKind } from '@/lib/whatsapp/incoming';

export async function createSubject(_previous: FormState, formData: FormData): Promise<FormState> {
    const guardian = await readGuardianSession();
    const kind = parseSubjectKind(String(formData.get('kind') ?? ''));
    const name = String(formData.get('name') ?? '').trim();
    const species = String(formData.get('species') ?? '').trim();

    if (!guardian) {
        return { error: 'Confirme o código do WhatsApp para continuar.', savedAt: null };
    }

    if (!kind) {
        return { error: 'Escolha pessoa ou pet.', savedAt: null };
    }

    if (!name) {
        return { error: 'Informe o nome.', savedAt: null };
    }

    if (kind === 'pet' && !species) {
        return { error: 'Informe a espécie do pet.', savedAt: null };
    }

    await insertSubject({
        guardianId: guardian.id,
        kind,
        name,
        species: kind === 'pet' ? species : null,
    });

    revalidatePath('/subjects');
    revalidatePath('/items');
    revalidatePath('/');

    return { error: null, savedAt: new Date().toISOString() };
}

export async function deleteSubject(formData: FormData): Promise<void> {
    const guardian = await readGuardianSession();
    if (!guardian) {
        return;
    }

    const subjectId = String(formData.get('subjectId') ?? '').trim();
    if (!subjectId) {
        return;
    }

    await deleteSubjectForGuardian({ subjectId, guardianId: guardian.id });
    revalidatePath('/subjects');
    revalidatePath('/items');
    revalidatePath('/upcoming');
}
