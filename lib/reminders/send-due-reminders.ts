import { findLatestLog, insertReminderLog, listCareItems, markCareItemReminded } from '@/lib/db/queries';
import { formatDateBr, subtractDays, todayInAppTimeZone } from '@/lib/dates';
import {
    createWhatsAppClient,
    getPhoneNumberId,
    getReminderTemplateLanguage,
    getReminderTemplateName,
    subjectKindInMessage,
} from '@/lib/whatsapp/client';

export interface SendRemindersResult {
    sent: number;
    failed: number;
    skipped: boolean;
}

let sendInProgress = false;

export async function sendDueReminders(): Promise<SendRemindersResult> {
    if (sendInProgress) {
        return { sent: 0, failed: 0, skipped: true };
    }

    sendInProgress = true;

    try {
        const today = todayInAppTimeZone();
        const dueItems = (await listCareItems()).filter((item) => {
            if (item.status !== 'pending') {
                return false;
            }

            const alertDate = subtractDays({ isoDate: item.dueDate, days: item.remindDaysBefore });
            return alertDate <= today;
        });

        let sent = 0;
        let failed = 0;

        for (const item of dueItems) {
            const outcome = await sendOneReminder(item);
            if (outcome === 'sent') {
                sent += 1;
            }

            if (outcome === 'failed') {
                failed += 1;
            }
        }

        return { sent, failed, skipped: false };
    } finally {
        sendInProgress = false;
    }
}

async function sendOneReminder(
    item: Awaited<ReturnType<typeof listCareItems>>[number],
): Promise<'sent' | 'failed' | 'unchanged'> {
    const client = createWhatsAppClient();
    if (!client) {
        await recordError({
            careItemId: item.id,
            errorMessage: 'KAPSO_API_KEY ausente. O lembrete não foi enviado.',
        });
        return 'failed';
    }

    try {
        const response = await client.messages.sendTemplate({
            phoneNumberId: getPhoneNumberId(),
            to: item.whatsappNumber,
            template: {
                name: getReminderTemplateName(),
                language: { code: getReminderTemplateLanguage() },
                components: [
                    {
                        type: 'body',
                        // Ordem do template lembrete_vencimento: item, nome, pessoa ou pet, data.
                        parameters: [
                            { type: 'text', text: item.name },
                            { type: 'text', text: item.subjectName },
                            { type: 'text', text: subjectKindInMessage(item.subjectKind) },
                            { type: 'text', text: formatDateBr(item.dueDate) },
                        ],
                    },
                ],
            },
        });

        await insertReminderLog({
            careItemId: item.id,
            kapsoMessageId: response.messages[0]?.id ?? null,
            outcome: 'success',
            errorMessage: null,
        });
        await markCareItemReminded(item.id);
        return 'sent';
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Falha ao enviar o lembrete.';
        const recorded = await recordError({ careItemId: item.id, errorMessage });
        return recorded ? 'failed' : 'unchanged';
    }
}

async function recordError({
    careItemId,
    errorMessage,
}: {
    careItemId: string;
    errorMessage: string;
}): Promise<boolean> {
    const latest = await findLatestLog(careItemId);
    if (latest?.outcome === 'error' && latest.errorMessage === errorMessage) {
        return false;
    }

    await insertReminderLog({
        careItemId,
        kapsoMessageId: null,
        outcome: 'error',
        errorMessage,
    });

    return true;
}

export function describePendingFailure(errorMessage: string | null): string {
    if (!errorMessage) {
        return 'O envio não ocorreu.';
    }

    return errorMessage;
}
