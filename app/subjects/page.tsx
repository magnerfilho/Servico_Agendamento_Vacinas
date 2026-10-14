import type { ReactElement } from 'react';
import Link from 'next/link';
import { DeleteSubjectButton } from '@/components/delete-subject-button';
import { SubjectForm } from '@/components/subject-form';
import { requireGuardian } from '@/lib/auth/require-guardian';
import { audienceLabel, parseAudience, withAudience } from '@/lib/audience';
import type { SubjectKind } from '@/lib/constants';
import { listSubjects } from '@/lib/db/queries';
import { subjectKindLabel } from '@/lib/labels';

export default async function SubjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ audience?: string }>;
}): Promise<ReactElement> {
    const audience = parseAudience((await searchParams).audience);
    const guardian = await requireGuardian({ path: '/subjects', audience });
    const subjects = (await listSubjects(guardian.id)).filter((subject) => !audience || subject.kind === audience);
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
                        <p className="empty">
                            {audience
                                ? `Nenhum cadastro de ${title.toLocaleLowerCase('pt-BR')} ainda.`
                                : 'Nenhuma pessoa ou pet ainda.'}
                        </p>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Tipo</th>
                                        <th>Responsável</th>
                                        <th>Ações</th>
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
                                            <td>
                                                <div className="row-actions">
                                                    <Link href={vaccinePath({ subjectId: subject.id, audience })}>Nova vacina</Link>
                                                    <DeleteSubjectButton subjectId={subject.id} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
                <section className="panel">
                    <h2>Novo cadastro</h2>
                    <SubjectForm audience={audience} />
                </section>
            </div>
        </main>
    );
}

function vaccinePath({ subjectId, audience }: { subjectId: string; audience: SubjectKind | null }): string {
    const path = withAudience({ path: '/items', audience });
    const joiner = path.includes('?') ? '&' : '?';
    return `${path}${joiner}subject=${subjectId}`;
}
