import type { ReactElement } from 'react';
import { redirect } from 'next/navigation';
import { LoginPanel } from '@/components/login-panel';
import { safeNextPath } from '@/lib/auth/paths';
import { readGuardianSession } from '@/lib/auth/session';
import { isValidPhone, normalizePhone } from '@/lib/phone';

export default async function EntrarPage({
    searchParams,
}: {
    searchParams: Promise<{ step?: string; phone?: string; next?: string }>;
}): Promise<ReactElement> {
    const params = await searchParams;
    const nextPath = safeNextPath(params.next);
    const session = await readGuardianSession();
    if (session) {
        redirect(nextPath);
    }

    const phone = normalizePhone(params.phone ?? '');
    const step = parseStep({ step: params.step, phone });

    return (
        <main className="stack">
            <div className="page-heading">
                <h1>Entrar</h1>
                <p className="lede">
                    Enviamos um código no WhatsApp do responsável para mostrar vacinas, medicamentos e os cadastros
                    ligados a esse número.
                </p>
            </div>
            <section className="panel">
                <LoginPanel step={step} phone={step === 'phone' ? '' : phone} nextPath={nextPath} />
            </section>
        </main>
    );
}

function parseStep({ step, phone }: { step: string | undefined; phone: string }): 'phone' | 'register' | 'code' {
    if (!isValidPhone(phone)) {
        return 'phone';
    }

    if (step === 'register' || step === 'code') {
        return step;
    }

    return 'phone';
}
