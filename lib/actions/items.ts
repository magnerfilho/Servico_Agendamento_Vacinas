'use server';

import { revalidatePath } from 'next/cache';
import { readGuardianSession } from '@/lib/auth/session';
import { validateRemindDays } from '@/lib/care/whatsapp-care';
import { insertCareItem, listSubjects } from '@/lib/db/queries';
import { parseDueDate, parseRemindTime } from '@/lib/dates';
import type { FormState } from '@/lib/actions/form-state';
import { parseCareItemKind } from '@/lib/whatsapp/incoming';

export async function createCareItem(_previous: FormState, formData: FormData): Promise<FormState> {
    const guardian = await readGuardianSession();
    const subjectId = String(formData.get('subjectId') ?? '').trim();
    const kind = parseCareItemKind(String(formData.get('kind') ?? ''));
    const name = String(formData.get('name') ?? '').trim();
    const dueDate = parseDueDate(String(formData.get('dueDate') ?? ''));
    const remindDaysBefore = Number(formData.get('remindDaysBefore'));
    const remindTime = parseRemindTime(String(formData.get('remindTime') ?? ''));

    if (!guardian) {
        return { error: 'Confirme o código do WhatsApp para continuar.', savedAt: null };
    }

    const subjects = await listSubjects(guardian.id);
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

    if (!remindTime) {
        return { error: 'Informe um horário válido para o alerta.', savedAt: null };
    }

    await insertCareItem({
        subjectId,
        kind,
        name,
        dueDate,
        remindDaysBefore,
        remindTime,
    });

    revalidatePath('/items');
    revalidatePath('/');

    return { error: null, savedAt: new Date().toISOString() };
}
