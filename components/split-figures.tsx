import type { ReactElement } from 'react';

export function DogFigure(): ReactElement {
    return (
        <svg className="split-figure" viewBox="70 40 210 270" aria-hidden="true">
            <ellipse cx="128" cy="286" rx="92" ry="16" fill="#e4d3bc" />
            <path d="M78 214c-28 8-46-10-42-28 6-22 34-18 48-6" fill="#c9a06a" />
            <ellipse cx="118" cy="196" rx="72" ry="48" fill="#d7b07a" />
            <ellipse cx="186" cy="168" rx="48" ry="42" fill="#e2c08a" />
            <path d="M168 132c8-28 34-36 42-18 6 14-8 28-22 30" fill="#c4965c" />
            <path d="M198 124c18-22 40-8 28 14-6 12-20 16-30 8" fill="#b8884e" />
            <circle cx="202" cy="162" r="5" fill="#2c241c" />
            <ellipse cx="228" cy="176" rx="16" ry="12" fill="#f3e2c8" />
            <circle cx="236" cy="174" r="4" fill="#2c241c" />
            <path d="M214 188c10 8 8 16-2 16" fill="none" stroke="#8d6840" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="248" cy="198" rx="22" ry="14" fill="#e7c99a" />
            <path d="M86 228c-8 28 6 36 22 28" fill="none" stroke="#c4965c" strokeWidth="12" strokeLinecap="round" />
            <path d="M132 236c-2 30 14 36 26 24" fill="none" stroke="#c4965c" strokeWidth="12" strokeLinecap="round" />
        </svg>
    );
}

export function PersonFigure(): ReactElement {
    return (
        <svg className="split-figure" viewBox="0 40 210 270" aria-hidden="true">
            <ellipse cx="150" cy="286" rx="78" ry="16" fill="#c9ddd2" />
            <path d="M118 168c-8 36-4 78 8 96h78c6-28 2-70-10-98-18 10-48 12-76 2z" fill="#1f6b4a" />
            <path d="M132 250c-6 22 4 32 18 30" fill="none" stroke="#245c42" strokeWidth="14" strokeLinecap="round" />
            <path d="M176 250c4 22 16 28 26 18" fill="none" stroke="#245c42" strokeWidth="14" strokeLinecap="round" />
            <circle cx="168" cy="92" r="40" fill="#e7c4a8" />
            <path d="M132 86c4-36 78-40 86-4-18-18-64-22-86 4z" fill="#3a2a22" />
            <circle cx="154" cy="90" r="4" fill="#2c241c" />
            <path d="M148 108c12 10 24 8 32-2" fill="none" stroke="#c48b6a" strokeWidth="3" strokeLinecap="round" />
            <path
                d="M124 156c-36 18-78 8-96-6 28 2 52 8 70 22"
                fill="none"
                stroke="#e7c4a8"
                strokeWidth="16"
                strokeLinecap="round"
            />
            <circle cx="28" cy="146" r="14" fill="#e7c4a8" />
            <path d="M150 150c28 8 48 4 62 16" fill="none" stroke="#e7c4a8" strokeWidth="16" strokeLinecap="round" />
        </svg>
    );
}
