'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import type { SubjectKind } from '@/lib/constants';
import { DogFigure, PersonFigure } from '@/components/split-figures';

type Side = SubjectKind;

const PET_LINKS = [
    { href: '/upcoming?audience=pet', label: 'Próximos vencimentos' },
    { href: '/guardians?audience=pet', label: 'Responsáveis' },
    { href: '/subjects?audience=pet', label: 'Pets' },
    { href: '/items?audience=pet', label: 'Vacinas e medicamentos' },
];

const PERSON_LINKS = [
    { href: '/upcoming?audience=person', label: 'Próximos vencimentos' },
    { href: '/guardians?audience=person', label: 'Responsáveis' },
    { href: '/subjects?audience=person', label: 'Pessoas' },
    { href: '/items?audience=person', label: 'Vacinas e medicamentos' },
];

export function AudienceSplit(): ReactElement {
    const [hovered, setHovered] = useState<Side | null>(null);
    const [locked, setLocked] = useState<Side | null>(null);
    const active = hovered ?? locked;
    const splitClass = active === 'pet' ? 'split split-pet-active' : active === 'person' ? 'split split-person-active' : 'split';

    function lockSide(side: Side): void {
        setLocked((current) => (current === side ? null : side));
    }

    return (
        <div className={splitClass} onMouseLeave={() => setHovered(null)}>
            <section
                className="split-panel split-pet"
                onMouseEnter={() => setHovered('pet')}
                onClick={() => lockSide('pet')}
            >
                <nav className="split-menu" aria-label="Opções para pets" onClick={(event) => event.stopPropagation()}>
                    <p className="split-kicker">Pets</p>
                    {PET_LINKS.map((link) => (
                        <Link key={link.href} href={link.href}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <DogFigure />
                <p className="split-idle-label">Pets</p>
            </section>
            <section
                className="split-panel split-person"
                onMouseEnter={() => setHovered('person')}
                onClick={() => lockSide('person')}
            >
                <PersonFigure />
                <nav className="split-menu" aria-label="Opções para pessoas" onClick={(event) => event.stopPropagation()}>
                    <p className="split-kicker">Pessoas</p>
                    {PERSON_LINKS.map((link) => (
                        <Link key={link.href} href={link.href}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <p className="split-idle-label">Pessoas</p>
            </section>
            <p className="split-hint">
                {locked ? 'Clique de novo no lado aberto para voltar.' : 'Passe o mouse para ampliar. Clique para fixar.'}
            </p>
        </div>
    );
}
