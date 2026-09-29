import { registerFromWhatsApp } from '@/lib/care/whatsapp-care';
import { isWebhookAuthorized } from '@/lib/whatsapp/client';

export async function POST(request: Request): Promise<Response> {
    if (!isWebhookAuthorized(request)) {
        return Response.json({ ok: false, message: 'Token do webhook inválido.' }, { status: 401 });
    }

    let body: unknown = null;
    try {
        body = await request.json();
    } catch {
        body = null;
    }

    const result = await registerFromWhatsApp(body);
    return Response.json(result);
}
