import { buildUpcomingMessage } from '@/lib/care/whatsapp-care';
import { isWebhookAuthorized } from '@/lib/whatsapp/client';

export async function POST(request: Request): Promise<Response> {
    if (!isWebhookAuthorized(request)) {
        return Response.json({ ok: false, message: 'Token do webhook inválido.' }, { status: 401 });
    }

    let phone = '';
    try {
        const body: unknown = await request.json();
        if (body && typeof body === 'object' && 'phone' in body) {
            const value = (body as { phone?: unknown }).phone;
            phone = typeof value === 'string' ? value : '';
        }
    } catch {
        phone = '';
    }

    const message = await buildUpcomingMessage(phone);
    return Response.json({ ok: true, message });
}
