'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { parseAudience, withAudience } from '@/lib/audience';
import type { SubjectKind } from '@/lib/constants';
import { DogFigure, PersonFigure } from '@/components/split-figures';

export function AudienceRail(): ReactElement | null {
    const pathname = usePathname();
    const audience = parseAudience(useSearchParams().get('audience') ?? undefined);

    if (pathname === '/entrar' || (audience !== 'person' && audience !== 'pet')) {
        return null;
    }

    const opposite: SubjectKind = audience === 'person' ? 'pet' : 'person';
    const href = withAudience({ path: pathname, audience: opposite });

    return (
        <Link
            className={opposite === 'pet' ? 'audience-rail audience-rail-pet' : 'audience-rail audience-rail-person'}
            href={href}
            aria-label={opposite === 'pet' ? 'Ir para pets' : 'Ir para pessoas'}
        >
            {opposite === 'pet' ? <DogFigure /> : <PersonFigure />}
        </Link>
    );
}
