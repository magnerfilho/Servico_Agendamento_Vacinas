import { randomInt } from 'node:crypto';
import { hashLoginCode, readSessionSecret, sessionSecretError } from '@/lib/auth/session';
import { LOGIN_CODE_LENGTH, LOGIN_CODE_RESEND_COOLDOWN_MS, LOGIN_CODE_TTL_MS } from '@/lib/constants';
import {
    deleteLoginCode,
    findLatestLoginCode,
    insertLoginCode,
    invalidateActiveLoginCodes,
} from '@/lib/db/queries';
import { sendLoginCode } from '@/lib/whatsapp/send-login-code';

const DECIMAL_RADIX = 10;

export async function issueLoginCode({
    guardianId,
    whatsappNumber,
}: {
    guardianId: string;
    whatsappNumber: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
    if (!readSessionSecret()) {
        return { ok: false, message: sessionSecretError() };
    }

    const latest = await findLatestLoginCode(guardianId);
    if (latest && Date.now() - Date.parse(latest.createdAt) < LOGIN_CODE_RESEND_COOLDOWN_MS) {
        return { ok: false, message: 'Aguarde um minuto para pedir outro código.' };
    }

    const code = createLoginCode();
    const codeHash = hashLoginCode({ code, guardianId });
    if (!codeHash) {
        return { ok: false, message: sessionSecretError() };
    }

    await invalidateActiveLoginCodes(guardianId);
    const record = await insertLoginCode({
        guardianId,
        codeHash,
        expiresAt: new Date(Date.now() + LOGIN_CODE_TTL_MS).toISOString(),
    });

    const sent = await sendLoginCode({ to: whatsappNumber, code });
    if (!sent.ok) {
        await deleteLoginCode(record.id);
        return sent;
    }

    return { ok: true };
}

function createLoginCode(): string {
    const maxExclusive = DECIMAL_RADIX ** LOGIN_CODE_LENGTH;
    return randomInt(0, maxExclusive).toString().padStart(LOGIN_CODE_LENGTH, '0');
}
