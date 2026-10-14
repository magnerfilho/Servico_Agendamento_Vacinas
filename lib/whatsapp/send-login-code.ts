import { createWhatsAppClient, getLoginTemplateLanguage, getLoginTemplateName, getPhoneNumberId } from '@/lib/whatsapp/client';

export async function sendLoginCode({
    to,
    code,
}: {
    to: string;
    code: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
    const client = createWhatsAppClient();
    if (!client) {
        return { ok: false, message: 'KAPSO_API_KEY ausente. O código não foi enviado.' };
    }

    try {
        await client.messages.sendTemplate({
            phoneNumberId: getPhoneNumberId(),
            to,
            template: {
                name: getLoginTemplateName(),
                language: { code: getLoginTemplateLanguage() },
                components: [
                    {
                        type: 'body',
                        parameters: [{ type: 'text', text: code }],
                    },
                    {
                        type: 'button',
                        subType: 'url',
                        index: '0',
                        parameters: [{ type: 'text', text: code }],
                    },
                ],
            },
        });

        return { ok: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Não foi possível enviar o código no WhatsApp.';
        return { ok: false, message };
    }
}
