'use client';

import { Suspense } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';

export function AppFrame({ children }: { children: ReactNode }): ReactElement {
    const pathname = usePathname();

    if (pathname === '/') {
        return <>{children}</>;
    }

    return (
        <div className="shell">
            <Suspense fallback={null}>
                <SiteHeader />
            </Suspense>
            {children}
        </div>
    );
}
