import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { AppFrame } from '@/components/app-frame';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Lembretes de vacinas',
    description: 'Cadastro de vacinas e medicamentos com lembrete no WhatsApp.',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
    return (
        <html lang="pt-BR">
            <body>
                <AppFrame>{children}</AppFrame>
            </body>
        </html>
    );
}
