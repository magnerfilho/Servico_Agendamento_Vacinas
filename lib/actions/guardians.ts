'use server';

import { revalidatePath } from 'next/cache';
import type { FormState } from '@/lib/actions/form-state';
import { findGuardianByPhone, insertGuardian } from '@/lib/db/queries';
import { readWhatsappFromForm } from '@/lib/phone';

export async function createGuardian(_previous: FormState, formData: FormData): Promise<FormState> {
    const name = String(formData.get('name') ?? '').trim();
    const phone = readWhatsappFromForm(formData);

    if (!name) {
        return { error: 'Informe o nome do responsável.', savedAt: null };
    }

    if ('error' in phone) {
        return { error: phone.error, savedAt: null };
    }

    const whatsappNumber = phone.whatsappNumber;

    const existing = await findGuardianByPhone(whatsappNumber);
    if (existing) {
        return { error: 'Esse WhatsApp já está cadastrado.', savedAt: null };
    }

    await insertGuardian({ name, whatsappNumber });
    revalidatePath('/guardians');
    revalidatePath('/subjects');
    revalidatePath('/');

    return { error: null, savedAt: new Date().toISOString() };
}
