'use client';

import { useActionState, useRef } from 'react';
import type { FormEvent, MutableRefObject, ReactElement } from 'react';
import Link from 'next/link';
import { confirmLoginCode, registerGuardian, requestLoginCode } from '@/lib/actions/login';
import { emptyFormState } from '@/lib/actions/form-state';
import { FormNotice } from '@/components/form-notice';
import { PhoneFields } from '@/components/phone-fields';
import { SubmitButton } from '@/components/submit-button';
import { LOGIN_CODE_LENGTH } from '@/lib/constants';
import { formatPhone } from '@/lib/phone';

export function LoginPanel({
    step,
    phone,
    nextPath,
}: {
    step: 'phone' | 'register' | 'code';
    phone: string;
    nextPath: string;
}): ReactElement {
    if (step === 'register') {
        return <RegisterStep phone={phone} nextPath={nextPath} />;
    }

    if (step === 'code') {
        return <CodeStep phone={phone} nextPath={nextPath} />;
    }

    return <PhoneStep nextPath={nextPath} />;
}

function PhoneStep({ nextPath }: { nextPath: string }): ReactElement {
    const [state, action] = useActionState(requestLoginCode, emptyFormState);
    const phoneGuard = usePhoneGuard();

    return (
        <form action={action} noValidate onSubmit={phoneGuard.guardSubmit}>
            <FormNotice state={state} />
            <input type="hidden" name="next" defaultValue={nextPath} />
            <PhoneFields validateRef={phoneGuard.validateRef} />
            <SubmitButton label="Enviar código" pendingLabel="Enviando..." />
        </form>
    );
}

function RegisterStep({ phone, nextPath }: { phone: string; nextPath: string }): ReactElement {
    const [state, action] = useActionState(registerGuardian, emptyFormState);
    const phoneGuard = usePhoneGuard();
    const otherNumber = `/entrar?next=${encodeURIComponent(nextPath)}`;

    return (
        <form action={action} noValidate onSubmit={phoneGuard.guardSubmit}>
            <p className="lede">Esse WhatsApp ainda não está cadastrado. Crie o responsável para receber o código.</p>
            <FormNotice state={state} />
            <input type="hidden" name="next" defaultValue={nextPath} />
            <label>
                Nome
                <input name="name" autoComplete="name" required />
            </label>
            <PhoneFields initialPhone={phone} validateRef={phoneGuard.validateRef} />
            <SubmitButton label="Cadastrar e enviar código" pendingLabel="Enviando..." />
            <Link href={otherNumber}>Usar outro número</Link>
        </form>
    );
}

function CodeStep({ phone, nextPath }: { phone: string; nextPath: string }): ReactElement {
    const [confirmState, confirmAction] = useActionState(confirmLoginCode, emptyFormState);
    const [resendState, resendAction] = useActionState(requestLoginCode, emptyFormState);
    const otherNumber = `/entrar?next=${encodeURIComponent(nextPath)}`;

    return (
        <div className="stack">
            <form action={confirmAction}>
                <p className="lede">Digite o código enviado para {formatPhone(phone)}.</p>
                <FormNotice state={confirmState} />
                <input type="hidden" name="next" defaultValue={nextPath} />
                <input type="hidden" name="whatsappNumber" defaultValue={phone} />
                <label>
                    Código
                    <input
                        name="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={LOGIN_CODE_LENGTH}
                        required
                    />
                </label>
                <SubmitButton label="Confirmar" pendingLabel="Confirmando..." />
            </form>
            <form action={resendAction}>
                <FormNotice state={resendState} />
                <input type="hidden" name="next" defaultValue={nextPath} />
                <input type="hidden" name="whatsappNumber" defaultValue={phone} />
                <SubmitButton label="Reenviar código" pendingLabel="Enviando..." />
            </form>
            <Link href={otherNumber}>Usar outro número</Link>
        </div>
    );
}

function usePhoneGuard(): {
    validateRef: MutableRefObject<(() => boolean) | null>;
    guardSubmit: (event: FormEvent<HTMLFormElement>) => void;
} {
    const validateRef = useRef<(() => boolean) | null>(null);

    function guardSubmit(event: FormEvent<HTMLFormElement>): void {
        if (validateRef.current && !validateRef.current()) {
            event.preventDefault();
        }
    }

    return { validateRef, guardSubmit };
}
