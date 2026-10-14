const DEFAULT_NEXT_PATH = '/upcoming';

const SAFE_NEXT_PATH = /^\/(upcoming|guardians|subjects|items)(\?audience=(person|pet))?$/;

export function safeNextPath(value: string | null | undefined): string {
    if (!value || !SAFE_NEXT_PATH.test(value)) {
        return DEFAULT_NEXT_PATH;
    }

    return value;
}

export function loginPath(nextPath: string): string {
    return `/entrar?next=${encodeURIComponent(safeNextPath(nextPath))}`;
}

export function loginStepPath({
    step,
    phone,
    nextPath,
}: {
    step: 'register' | 'code';
    phone: string;
    nextPath: string;
}): string {
    const params = new URLSearchParams({
        step,
        phone,
        next: safeNextPath(nextPath),
    });

    return `/entrar?${params.toString()}`;
}
