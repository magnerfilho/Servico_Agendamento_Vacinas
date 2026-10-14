import type { ReactElement } from 'react';
import { requireGuardian } from '@/lib/auth/require-guardian';
import { audienceLabel, parseAudience } from '@/lib/audience';
import { formatPhone } from '@/lib/phone';

export default async function GuardiansPage({
    searchParams,
}: {
    searchParams: Promise<{ audience?: string }>;
}): Promise<ReactElement> {
    const audience = parseAudience((await searchParams).audience);
    const guardian = await requireGuardian({ path: '/guardians', audience });
    const scope = audience ? audienceLabel(audience).toLocaleLowerCase('pt-BR') : null;

    return (
        <main>
            <div className="page-heading">
                <h1>Responsável</h1>
                <p className="lede">
                    Quem recebe o lembrete no WhatsApp.
                    {scope ? ` Este cadastro segue para ${scope}.` : ' Pessoas e pets ficam ligados a este número.'}
                </p>
            </div>
            <section className="panel">
                <h2>{guardian.name}</h2>
                <p className="lede">{formatPhone(guardian.whatsappNumber)}</p>
            </section>
        </main>
    );
}
