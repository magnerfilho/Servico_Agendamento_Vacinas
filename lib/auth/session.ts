import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from '@/lib/constants';
import { findGuardianById, type GuardianRecord } from '@/lib/db/queries';

const MISSING_SESSION_SECRET = 'Defina SESSION_SECRET ou WHATSAPP_WEBHOOK_SECRET para assinar a sessão.';

// O cookie do Next espera maxAge em segundos.
const MILLISECONDS_PER_SECOND = 1000;

const COOKIE_PART_COUNT = 3;

export function readSessionSecret(): string | null {
    const secret = process.env.SESSION_SECRET || process.env.WHATSAPP_WEBHOOK_SECRET || '';
    if (!secret) {
        return null;
    }

    return secret;
}

export function sessionSecretError(): string {
    return MISSING_SESSION_SECRET;
}

export async function startGuardianSession(guardianId: string): Promise<void> {
    const secret = readSessionSecret();
    if (!secret) {
        throw new Error(MISSING_SESSION_SECRET);
    }

    const expiresAt = Date.now() + SESSION_TTL_MS;
    const payload = `${guardianId}.${expiresAt}`;
    const signature = sign({ payload, secret });
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, `${payload}.${signature}`, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: SESSION_TTL_MS / MILLISECONDS_PER_SECOND,
    });
}

export async function readGuardianSession(): Promise<GuardianRecord | null> {
    const secret = readSessionSecret();
    if (!secret) {
        return null;
    }

    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const guardianId = readGuardianId({ raw, secret });
    if (!guardianId) {
        return null;
    }

    return findGuardianById(guardianId);
}

export async function clearGuardianSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export function hashLoginCode({ code, guardianId }: { code: string; guardianId: string }): string | null {
    const secret = readSessionSecret();
    if (!secret) {
        return null;
    }

    return createHmac('sha256', secret).update(`${guardianId}:${code}`).digest('hex');
}

export function hashesMatch({ left, right }: { left: string; right: string }): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
}

function sign({ payload, secret }: { payload: string; secret: string }): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
}

function readGuardianId({ raw, secret }: { raw: string | undefined; secret: string }): string | null {
    if (!raw) {
        return null;
    }

    const parts = raw.split('.');
    if (parts.length !== COOKIE_PART_COUNT) {
        return null;
    }

    const guardianId = parts[0] ?? '';
    const expiresAt = Number(parts[1]);
    const signature = parts[2] ?? '';
    if (!guardianId || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        return null;
    }

    const payload = `${guardianId}.${expiresAt}`;
    const expected = sign({ payload, secret });
    if (!hashesMatch({ left: signature, right: expected })) {
        return null;
    }

    return guardianId;
}
