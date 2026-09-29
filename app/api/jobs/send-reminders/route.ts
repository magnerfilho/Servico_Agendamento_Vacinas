import { sendDueReminders } from '@/lib/reminders/send-due-reminders';
import { isWebhookAuthorized } from '@/lib/whatsapp/client';

export async function POST(request: Request): Promise<Response> {
    if (!isWebhookAuthorized(request)) {
        return Response.json({ ok: false, message: 'Token do webhook inválido.' }, { status: 401 });
    }

    const result = await sendDueReminders();
    return Response.json({ ok: true, ...result });
}
