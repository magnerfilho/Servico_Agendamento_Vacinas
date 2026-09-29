import type { ReactElement } from 'react';
import { SubjectForm } from '@/components/subject-form';
import { audienceLabel, parseAudience } from '@/lib/audience';
import { listGuardians, listSubjects } from '@/lib/db/queries';
import { subjectKindLabel } from '@/lib/labels';

export default async function SubjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ audience?: string }>;
}): Promise<ReactElement> {
    const audience = parseAudience((await searchParams).audience);
    const [guardians, allSubjects] = await Promise.all([listGuardians(), listSubjects()]);
    const subjects = allSubjects.filter((subject) => !audience || subject.kind === audience);
    const title = audience ? audienceLabel(audience) : 'Pessoas e pets';

    return (
        <main>
            <div className="page-heading">
                <h1>{title}</h1>
                <p className="lede">Cada um fica com o responsável que recebe o alerta.</p>
            </div>
            <div className="grid-2">
                <section className="panel">
                    <h2>Cadastrados</h2>
                    {subjects.length === 0 ? (
                        <p className="empty">{audience ? `Nenhum cadastro de ${title.toLocaleLowerCase('pt-BR')} ainda.` : 'Nenhuma pessoa ou pet ainda.'}</p>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Tipo</th>
                                        <th>Responsável</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject) => (
                                        <tr key={subject.id}>
                                            <td>
                                                {subject.name}
                                                {subject.species ? <span className="meta"> · {subject.species}</span> : null}
                                            </td>
                                            <td>{subjectKindLabel(subject.kind)}</td>
                                            <td>{subject.guardianName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
                <section className="panel">
                    <h2>Novo cadastro</h2>
                    {guardians.length === 0 ? (
                        <p className="empty">Cadastre um responsável antes.</p>
                    ) : (
                        <SubjectForm
                            audience={audience}
                            guardians={guardians.map((guardian) => ({ id: guardian.id, name: guardian.name }))}
                        />
                    )}
                </section>
            </div>
        </main>
    );
}
