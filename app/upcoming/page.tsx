import type { ReactElement } from 'react';
import { listCareItems, listLatestLogs } from '@/lib/db/queries';
import { formatDateBr, subtractDays } from '@/lib/dates';
import { careItemKindLabel, careItemStatusLabel, subjectKindLabel } from '@/lib/labels';
import { formatPhone } from '@/lib/phone';
import { audienceLabel, parseAudience } from '@/lib/audience';

export default async function UpcomingPage({
    searchParams,
}: {
    searchParams: Promise<{ audience?: string }>;
}): Promise<ReactElement> {
    const audience = parseAudience((await searchParams).audience);
    const items = (await listCareItems()).filter((item) => !audience || item.subjectKind === audience);
    const logs = await listLatestLogs(items.map((item) => item.id));
    const scope = audience ? audienceLabel(audience).toLocaleLowerCase('pt-BR') : null;

    return (
        <main className="stack">
            <div className="page-heading">
                <h1>{scope ? `Próximos vencimentos de ${scope}` : 'Próximos vencimentos'}</h1>
                <p className="lede">
                    Os dados ficam neste computador: nome, WhatsApp e datas. O lembrete sai pelo WhatsApp na data do
                    alerta. Se o template da Meta ainda não foi aprovado, o item continua pendente e o erro aparece
                    aqui.
                </p>
            </div>
            <section className="panel">
                {items.length === 0 ? (
                    <p className="empty">{scope ? `Nenhum lembrete de ${scope} cadastrado.` : 'Nenhum lembrete cadastrado.'}</p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Quem</th>
                                    <th>Item</th>
                                    <th>Vencimento</th>
                                    <th>Alerta</th>
                                    <th>Status</th>
                                    <th>WhatsApp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const log = logs.get(item.id);
                                    const showFailure = item.status === 'pending' && log?.outcome === 'error';
                                    const alertDate = subtractDays({
                                        isoDate: item.dueDate,
                                        days: item.remindDaysBefore,
                                    });

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                {item.subjectName}
                                                <span className="meta">
                                                    {' '}
                                                    · {subjectKindLabel(item.subjectKind)}
                                                    {item.species ? ` · ${item.species}` : ''}
                                                </span>
                                            </td>
                                            <td>
                                                {item.name}
                                                <span className="meta"> · {careItemKindLabel(item.kind)}</span>
                                            </td>
                                            <td>{formatDateBr(item.dueDate)}</td>
                                            <td>{formatDateBr(alertDate)}</td>
                                            <td>
                                                <span
                                                    className={
                                                        item.status === 'pending' ? 'badge badge-pending' : 'badge badge-reminded'
                                                    }
                                                >
                                                    {careItemStatusLabel(item.status)}
                                                </span>
                                                {showFailure ? <span className="failure">{log.errorMessage}</span> : null}
                                            </td>
                                            <td>
                                                {item.guardianName}
                                                <span className="meta"> · {formatPhone(item.whatsappNumber)}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
