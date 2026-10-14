import {
    LOGIN_TEMPLATE_LANGUAGE,
    LOGIN_TEMPLATE_NAME,
    REMINDER_TEMPLATE_LANGUAGE,
    REMINDER_TEMPLATE_NAME,
    WHATSAPP_PHONE_NUMBER_ID,
    type SubjectKind,
} from '@/lib/constants';
import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';

export function createWhatsAppClient(): WhatsAppClient | null {
    const apiKey = process.env.KAPSO_API_KEY;
    if (!apiKey) {
        return null;
    }

    const host = (process.env.KAPSO_API_BASE_URL || 'https://api.kapso.ai').replace(/\/$/, '');

    return new WhatsAppClient({
        baseUrl: `${host}/meta/whatsapp`,
        kapsoApiKey: apiKey,
    });
}

export function getPhoneNumberId(): string {
    return process.env.WHATSAPP_PHONE_NUMBER_ID || WHATSAPP_PHONE_NUMBER_ID;
}

export function getReminderTemplateName(): string {
    return process.env.WHATSAPP_TEMPLATE_NAME || REMINDER_TEMPLATE_NAME;
}

export function getReminderTemplateLanguage(): string {
    return process.env.WHATSAPP_TEMPLATE_LANGUAGE || REMINDER_TEMPLATE_LANGUAGE;
}

export function getLoginTemplateName(): string {
    return process.env.WHATSAPP_LOGIN_TEMPLATE_NAME || LOGIN_TEMPLATE_NAME;
}

export function getLoginTemplateLanguage(): string {
    return process.env.WHATSAPP_LOGIN_TEMPLATE_LANGUAGE || LOGIN_TEMPLATE_LANGUAGE;
}

export function subjectKindInMessage(kind: SubjectKind): string {
    return kind === 'person' ? 'pessoa' : 'pet';
}

export function isWebhookAuthorized(request: Request): boolean {
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET ?? '';
    if (!secret) {
        return true;
    }

    return request.headers.get('x-reminder-token') === secret;
}
