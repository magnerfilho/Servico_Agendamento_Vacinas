'use client';

import { Suspense } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { audienceLabel, parseAudience, withAudience } from '@/lib/audience';

export function SiteHeader(): ReactElement {
    return (
        <Suspense fallback={null}>
            <SiteHeaderNav />
        </Suspense>
    );
}

function SiteHeaderNav(): ReactElement {
    const pathname = usePathname();
    const audience = parseAudience(useSearchParams().get('audience') ?? undefined);
    const subjectsLabel = audience ? audienceLabel(audience) : 'Pessoas e pets';
    const links = [
        { href: '/', label: 'Início' },
        { href: withAudience({ path: '/upcoming', audience }), label: 'Próximos' },
        { href: withAudience({ path: '/guardians', audience }), label: 'Responsáveis' },
        { href: withAudience({ path: '/subjects', audience }), label: subjectsLabel },
        { href: withAudience({ path: '/items', audience }), label: 'Vacinas e medicamentos' },
    ];

    return (
        <header className="topbar">
            <div className="brand">
                <strong>Lembretes</strong>
                <span>{audience ? audienceLabel(audience) : 'Vacinas e medicamentos, no WhatsApp'}</span>
            </div>
            <nav className="nav" aria-label="Seções">
                {links.map((link) => {
                    const path = link.href.split('?')[0] ?? link.href;

                    return (
                        <Link key={link.label} href={link.href} aria-current={pathname === path ? 'page' : undefined}>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
