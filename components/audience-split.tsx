'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { loginPath } from '@/lib/auth/paths';
import { withAudience } from '@/lib/audience';
import type { SubjectKind } from '@/lib/constants';
import { DogFigure, PersonFigure } from '@/components/split-figures';

type Side = SubjectKind;

const SPLIT_LINE = 'Não deixe a saúde de quem importa de lado.';

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
                <SplitOffer audience="pet" label="Prosseguir para pets" />
                <DogFigure />
                <p className="split-idle-label">Pets</p>
            </section>
            <section
                className="split-panel split-person"
                onMouseEnter={() => setHovered('person')}
                onClick={() => lockSide('person')}
            >
                <PersonFigure />
                <SplitOffer audience="person" label="Prosseguir para pessoas" />
                <p className="split-idle-label">Pessoas</p>
            </section>
            <p className="split-hint">
                {locked ? 'Toque de novo no lado aberto para voltar.' : 'Passe o mouse ou toque para ampliar.'}
            </p>
        </div>
    );
}

function SplitOffer({ audience, label }: { audience: SubjectKind; label: string }): ReactElement {
    const href = loginPath(withAudience({ path: '/upcoming', audience }));

    return (
        <div className="split-offer">
            <p className="split-line">{SPLIT_LINE}</p>
            <Link className="split-proceed" href={href} onClick={(event) => event.stopPropagation()}>
                {label}
            </Link>
        </div>
    );
}
