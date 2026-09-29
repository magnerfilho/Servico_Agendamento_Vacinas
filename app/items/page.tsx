import type { ReactElement } from 'react';
import { ItemForm } from '@/components/item-form';
import { listCareItems, listSubjects } from '@/lib/db/queries';
import { formatDateBr } from '@/lib/dates';
import { careItemKindLabel, subjectKindLabel } from '@/lib/labels';
import { remindSentence } from '@/lib/care/whatsapp-care';
import { audienceLabel, parseAudience } from '@/lib/audience';

export default async function ItemsPage({
    searchParams,
}: {
    searchParams: Promise<{ audience?: string }>;
}): Promise<ReactElement> {
    const audience = parseAudience((await searchParams).audience);
    const [allSubjects, allItems] = await Promise.all([listSubjects(), listCareItems()]);
    const subjects = allSubjects.filter((subject) => !audience || subject.kind === audience);
    const items = allItems.filter((item) => !audience || item.subjectKind === audience);
    const scope = audience ? audienceLabel(audience).toLocaleLowerCase('pt-BR') : null;

    return (
        <main>
            <div className="page-heading">
                <h1>{scope ? `Vacinas e medicamentos de ${scope}` : 'Vacinas e medicamentos'}</h1>
                <p className="lede">A data é o vencimento. O alerta sai alguns dias antes, no WhatsApp do responsável.</p>
            </div>
            <div className="grid-2">
                <section className="panel">
                    <h2>Cadastrados</h2>
                    {items.length === 0 ? (
                        <p className="empty">{scope ? `Nenhuma vacina ou medicamento de ${scope} ainda.` : 'Nenhuma vacina ou medicamento ainda.'}</p>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quem</th>
                                        <th>Vencimento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {item.name}
                                                <span className="meta"> · {careItemKindLabel(item.kind)}</span>
                                            </td>
                                            <td>
                                                {item.subjectName}
                                                <span className="meta"> · {subjectKindLabel(item.subjectKind)}</span>
                                            </td>
                                            <td>
                                                {formatDateBr(item.dueDate)}
                                                <span className="meta"> · {remindSentence(item.remindDaysBefore)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
                <section className="panel">
                    <h2>Novo lembrete</h2>
                    {subjects.length === 0 ? (
                        <p className="empty">
                            {audience === 'person'
                                ? 'Cadastre uma pessoa antes.'
                                : audience === 'pet'
                                  ? 'Cadastre um pet antes.'
                                  : 'Cadastre uma pessoa ou um pet antes.'}
                        </p>
                    ) : (
                        <ItemForm
                            subjects={subjects.map((subject) => ({
                                id: subject.id,
                                label: `${subject.name} (${subjectKindLabel(subject.kind)}) — ${subject.guardianName}`,
                            }))}
                        />
                    )}
                </section>
            </div>
        </main>
    );
}
