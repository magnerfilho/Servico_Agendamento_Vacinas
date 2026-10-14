import {
    DEFAULT_GUARDIAN_NAME,
    DEFAULT_REMIND_DAYS_BEFORE,
    DEFAULT_REMIND_TIME,
    MAX_REMIND_DAYS_BEFORE,
    MAX_UPCOMING_ITEMS,
} from '@/lib/constants';
import {
    findGuardianByPhone,
    findSubjectByIdentity,
    insertCareItem,
    insertGuardian,
    insertSubject,
    listCareItems,
    type CareItemRecord,
} from '@/lib/db/queries';
import { formatDateBr, parseDueDate, todayInAppTimeZone } from '@/lib/dates';
import { careItemKindLabel, subjectKindLabel } from '@/lib/labels';
import { isValidPhone, normalizePhone } from '@/lib/phone';
import { parseCareItemKind, parseSubjectKind, readIncomingText } from '@/lib/whatsapp/incoming';

export async function registerFromWhatsApp(body: unknown): Promise<{ ok: boolean; message: string }> {
    if (!body || typeof body !== 'object') {
        return { ok: false, message: 'Não recebi os dados do cadastro.' };
    }

    const record = body as Record<string, unknown>;
    const whatsappNumber = normalizePhone(readIncomingText(record.phone));
    const subjectKind = parseSubjectKind(record.subjectKind);
    const subjectName = readIncomingText(record.subjectName);
    const species = readIncomingText(record.species);
    const itemKind = parseCareItemKind(record.itemKind);
    const itemName = readIncomingText(record.itemName);
    const dueDate = parseDueDate(readIncomingText(record.dueDate));

    if (!isValidPhone(whatsappNumber)) {
        return { ok: false, message: 'Não consegui ler o WhatsApp de quem enviou a mensagem.' };
    }

    if (!subjectKind) {
        return { ok: false, message: 'Não entendi se o lembrete é para uma pessoa ou para um pet.' };
    }

    if (!subjectName) {
        return { ok: false, message: 'Informe o nome da pessoa ou do pet.' };
    }

    if (subjectKind === 'pet' && !species) {
        return { ok: false, message: 'Informe a espécie do pet. Por exemplo: cão ou gato.' };
    }

    if (!itemKind) {
        return { ok: false, message: 'Não entendi se é vacina ou medicamento.' };
    }

    if (!itemName) {
        return { ok: false, message: 'Informe o nome da vacina ou do medicamento.' };
    }

    if (!dueDate) {
        return { ok: false, message: 'Não entendi a data. Use o formato DD/MM/AAAA.' };
    }

    const guardian =
        (await findGuardianByPhone(whatsappNumber)) ??
        (await insertGuardian({ name: DEFAULT_GUARDIAN_NAME, whatsappNumber }));

    const existingSubject = await findSubjectByIdentity({
        guardianId: guardian.id,
        kind: subjectKind,
        name: subjectName,
    });

    const subjectId =
        existingSubject?.id ??
        (await insertSubject({
            guardianId: guardian.id,
            kind: subjectKind,
            name: subjectName,
            species: subjectKind === 'pet' ? species : null,
        }));

    await insertCareItem({
        subjectId,
        kind: itemKind,
        name: itemName,
        dueDate,
        remindDaysBefore: DEFAULT_REMIND_DAYS_BEFORE,
        remindTime: DEFAULT_REMIND_TIME,
    });

    const reminder = remindSentence({
        days: DEFAULT_REMIND_DAYS_BEFORE,
        remindTime: DEFAULT_REMIND_TIME,
    });

    return {
        ok: true,
        message: `Pronto. Cadastrei ${itemName} de ${subjectName}, com vencimento em ${formatDateBr(dueDate)}. ${reminder}`,
    };
}

export async function buildUpcomingMessage(phone: string): Promise<string> {
    const whatsappNumber = normalizePhone(readIncomingText(phone));

    if (!isValidPhone(whatsappNumber)) {
        return 'Não consegui ler o WhatsApp de quem pediu a lista.';
    }
    const guardian = await findGuardianByPhone(whatsappNumber);

    if (!guardian) {
        return 'Não há lembretes cadastrados para este WhatsApp.';
    }

    const today = todayInAppTimeZone();
    const upcoming = (await listCareItems()).filter(
        (item) => item.whatsappNumber === whatsappNumber && (item.dueDate >= today || item.status === 'pending'),
    );

    if (upcoming.length === 0) {
        return 'Não há lembretes pendentes ou futuros para este WhatsApp.';
    }

    const visible = upcoming.slice(0, MAX_UPCOMING_ITEMS);
    const lines = visible.map((item) => formatUpcomingLine(item));
    const hiddenCount = upcoming.length - visible.length;
    const extra = hiddenCount > 0 ? `\nE mais ${hiddenCount}.` : '';

    return `Próximos lembretes:\n${lines.join('\n')}${extra}`;
}

export function validateRemindDays(value: number): string | null {
    if (!Number.isInteger(value) || value < 0 || value > MAX_REMIND_DAYS_BEFORE) {
        return `Informe a antecedência entre 0 e ${MAX_REMIND_DAYS_BEFORE} dias.`;
    }

    return null;
}

export function remindSentence({ days, remindTime }: { days: number; remindTime: string }): string {
    if (days === 0) {
        return `O lembrete sai no dia do vencimento, às ${remindTime}.`;
    }

    if (days === 1) {
        return `O lembrete sai 1 dia antes, às ${remindTime}.`;
    }

    return `O lembrete sai ${days} dias antes, às ${remindTime}.`;
}

function formatUpcomingLine(item: CareItemRecord): string {
    const itemKind = careItemKindLabel(item.kind).toLocaleLowerCase('pt-BR');
    return `- ${item.name} (${itemKind}) de ${describeSubject(item)} vence em ${formatDateBr(item.dueDate)}`;
}

function describeSubject(item: CareItemRecord): string {
    const kind = subjectKindLabel(item.subjectKind).toLocaleLowerCase('pt-BR');
    if (item.species) {
        return `${item.subjectName} (${item.species}, ${kind})`;
    }

    return `${item.subjectName} (${kind})`;
}
