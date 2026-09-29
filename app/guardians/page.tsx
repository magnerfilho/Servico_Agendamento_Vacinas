import type { ReactElement } from 'react';
import { GuardianForm } from '@/components/guardian-form';
import { audienceLabel, parseAudience } from '@/lib/audience';
import { listGuardians } from '@/lib/db/queries';
import { formatPhone } from '@/lib/phone';

export default async function GuardiansPage({
    searchParams,
}: {
    searchParams: Promise<{ audience?: string }>;
}): Promise<ReactElement> {
    const audience = parseAudience((await searchParams).audience);
    const guardians = await listGuardians();
    const scope = audience ? audienceLabel(audience).toLocaleLowerCase('pt-BR') : null;

    return (
        <main>
            <div className="page-heading">
                <h1>Responsáveis</h1>
                <p className="lede">
                    Quem recebe o lembrete no WhatsApp.
                    {scope ? ` Este cadastro segue para ${scope}.` : ' Pessoas e pets ficam ligados a um responsável.'}
                </p>
            </div>
            <div className="grid-2">
                <section className="panel">
                    <h2>Cadastrados</h2>
                    {guardians.length === 0 ? (
                        <p className="empty">Nenhum responsável ainda.</p>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>WhatsApp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guardians.map((guardian) => (
                                        <tr key={guardian.id}>
                                            <td>{guardian.name}</td>
                                            <td>{formatPhone(guardian.whatsappNumber)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
                <section className="panel">
                    <h2>Novo responsável</h2>
                    <GuardianForm />
                </section>
            </div>
        </main>
    );
}
