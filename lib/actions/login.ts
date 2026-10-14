'use server';

import { redirect } from 'next/navigation';
import { createGuardian } from '@/lib/actions/guardians';
import { issueLoginCode } from '@/lib/auth/issue-login-code';
import { loginStepPath, safeNextPath } from '@/lib/auth/paths';
import {
    clearGuardianSession,
    hashLoginCode,
    hashesMatch,
    readSessionSecret,
    sessionSecretError,
    startGuardianSession,
} from '@/lib/auth/session';
import type { FormState } from '@/lib/actions/form-state';
import { LOGIN_CODE_LENGTH, LOGIN_CODE_MAX_ATTEMPTS } from '@/lib/constants';
import {
    consumeLoginCode,
    findActiveLoginCode,
    findGuardianByPhone,
    registerFailedLoginAttempt,
} from '@/lib/db/queries';
import { normalizePhone, readWhatsappFromForm } from '@/lib/phone';

export async function requestLoginCode(_previous: FormState, formData: FormData): Promise<FormState> {
    const phone = readWhatsappFromForm(formData);
    const nextPath = safeNextPath(String(formData.get('next') ?? ''));

    if ('error' in phone) {
        return { error: phone.error, savedAt: null };
    }

    const whatsappNumber = phone.whatsappNumber;

    const guardian = await findGuardianByPhone(whatsappNumber);
    if (!guardian) {
        redirect(loginStepPath({ step: 'register', phone: whatsappNumber, nextPath }));
    }

    const issued = await issueLoginCode({ guardianId: guardian.id, whatsappNumber });
    if (!issued.ok) {
        return { error: issued.message, savedAt: null };
    }

    redirect(loginStepPath({ step: 'code', phone: whatsappNumber, nextPath }));
}

export async function registerGuardian(previous: FormState, formData: FormData): Promise<FormState> {
    if (!readSessionSecret()) {
        return { error: sessionSecretError(), savedAt: null };
    }

    const created = await createGuardian(previous, formData);
    if (created.error) {
        return created;
    }

    return requestLoginCode(previous, formData);
}

export async function confirmLoginCode(_previous: FormState, formData: FormData): Promise<FormState> {
    const phone = readWhatsappFromForm(formData);
    const code = normalizePhone(String(formData.get('code') ?? ''));
    const nextPath = safeNextPath(String(formData.get('next') ?? ''));

    if ('error' in phone) {
        return { error: phone.error, savedAt: null };
    }

    const whatsappNumber = phone.whatsappNumber;

    if (code.length !== LOGIN_CODE_LENGTH) {
        return { error: `Informe o código de ${LOGIN_CODE_LENGTH} dígitos recebido no WhatsApp.`, savedAt: null };
    }

    const guardian = await findGuardianByPhone(whatsappNumber);
    if (!guardian) {
        return { error: 'Esse WhatsApp ainda não está cadastrado.', savedAt: null };
    }

    const active = await findActiveLoginCode(guardian.id);
    if (!active) {
        return { error: 'Peça um novo código.', savedAt: null };
    }

    if (Date.parse(active.expiresAt) <= Date.now()) {
        await consumeLoginCode(active.id);
        return { error: 'Esse código expirou. Peça outro.', savedAt: null };
    }

    if (active.attempts >= LOGIN_CODE_MAX_ATTEMPTS) {
        await consumeLoginCode(active.id);
        return { error: 'Muitas tentativas. Peça outro código.', savedAt: null };
    }

    const codeHash = hashLoginCode({ code, guardianId: guardian.id });
    if (!codeHash || !hashesMatch({ left: codeHash, right: active.codeHash })) {
        const attempts = active.attempts + 1;
        const consumedAt = attempts >= LOGIN_CODE_MAX_ATTEMPTS ? new Date().toISOString() : null;
        await registerFailedLoginAttempt({ id: active.id, attempts, consumedAt });

        if (consumedAt) {
            return { error: 'Muitas tentativas. Peça outro código.', savedAt: null };
        }

        return { error: 'Código incorreto.', savedAt: null };
    }

    await consumeLoginCode(active.id);
    await startGuardianSession(guardian.id);
    redirect(nextPath);
}

export async function logout(): Promise<void> {
    await clearGuardianSession();
    redirect('/');
}
