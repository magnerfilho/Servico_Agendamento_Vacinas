'use server';

import { revalidatePath } from 'next/cache';
import { validateRemindDays } from '@/lib/care/whatsapp-care';
import { insertCareItem, listSubjects } from '@/lib/db/queries';
import { parseDueDate } from '@/lib/dates';
import type { FormState } from '@/lib/actions/form-state';
import { parseCareItemKind } from '@/lib/whatsapp/incoming';

export async function createCareItem(_previous: FormState, formData: FormData): Promise<FormState> {
    const subjectId = String(formData.get('subjectId') ?? '').trim();
    const kind = parseCareItemKind(String(formData.get('kind') ?? ''));
    const name = String(formData.get('name') ?? '').trim();
    const dueDate = parseDueDate(String(formData.get('dueDate') ?? ''));
    const remindDaysBefore = Number(formData.get('remindDaysBefore'));

    const subjects = await listSubjects();
    if (!subjects.some((subject) => subject.id === subjectId)) {
        return { error: 'Escolha a pessoa ou o pet.', savedAt: null };
    }

    if (!kind) {
        return { error: 'Escolha vacina ou medicamento.', savedAt: null };
    }

    if (!name) {
        return { error: 'Informe o nome da vacina ou do medicamento.', savedAt: null };
    }

    if (!dueDate) {
        return { error: 'Informe uma data de vencimento válida.', savedAt: null };
    }

    const remindDaysError = validateRemindDays(remindDaysBefore);
    if (remindDaysError) {
        return { error: remindDaysError, savedAt: null };
    }

    await insertCareItem({
        subjectId,
        kind,
        name,
        dueDate,
        remindDaysBefore,
    });

    revalidatePath('/items');
    revalidatePath('/');

    return { error: null, savedAt: new Date().toISOString() };
}
