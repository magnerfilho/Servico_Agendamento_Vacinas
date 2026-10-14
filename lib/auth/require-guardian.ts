import { redirect } from 'next/navigation';
import { loginPath } from '@/lib/auth/paths';
import { readGuardianSession } from '@/lib/auth/session';
import { withAudience } from '@/lib/audience';
import type { SubjectKind } from '@/lib/constants';
import type { GuardianRecord } from '@/lib/db/queries';

export async function requireGuardian({
    path,
    audience,
}: {
    path: string;
    audience: SubjectKind | null;
}): Promise<GuardianRecord> {
    const guardian = await readGuardianSession();
    if (!guardian) {
        redirect(loginPath(withAudience({ path, audience })));
    }

    return guardian;
}
