'use client';

import { Suspense } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AudienceRail } from '@/components/audience-rail';
import { SiteHeader } from '@/components/site-header';

export function AppFrame({ children }: { children: ReactNode }): ReactElement {
    const pathname = usePathname();

    if (pathname === '/') {
        return <>{children}</>;
    }

    return (
        <Suspense fallback={<div className="shell">{children}</div>}>
            <FramedLayout>{children}</FramedLayout>
        </Suspense>
    );
}

function FramedLayout({ children }: { children: ReactNode }): ReactElement {
    return (
        <div className="framed">
            <AudienceRail />
            <div className="shell">
                <Suspense fallback={null}>
                    <SiteHeader />
                </Suspense>
                {children}
            </div>
        </div>
    );
}
