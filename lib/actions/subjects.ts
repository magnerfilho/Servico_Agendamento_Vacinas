'use server';

import { revalidatePath } from 'next/cache';
import { insertSubject, listGuardians } from '@/lib/db/queries';
import type { FormState } from '@/lib/actions/form-state';
import { parseSubjectKind } from '@/lib/whatsapp/incoming';

export async function createSubject(_previous: FormState, formData: FormData): Promise<FormState> {
    const guardianId = String(formData.get('guardianId') ?? '').trim();
    const kind = parseSubjectKind(String(formData.get('kind') ?? ''));
    const name = String(formData.get('name') ?? '').trim();
    const species = String(formData.get('species') ?? '').trim();

    const guardians = await listGuardians();
    if (!guardians.some((guardian) => guardian.id === guardianId)) {
        return { error: 'Escolha um responsável.', savedAt: null };
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
        guardianId,
        kind,
        name,
        species: kind === 'pet' ? species : null,
    });

    revalidatePath('/subjects');
    revalidatePath('/items');
    revalidatePath('/');

    return { error: null, savedAt: new Date().toISOString() };
}
