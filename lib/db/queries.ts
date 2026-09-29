import { asc, desc, eq, inArray } from 'drizzle-orm';
import {
    careItemKinds,
    careItemStatuses,
    reminderOutcomes,
    subjectKinds,
    type CareItemKind,
    type CareItemStatus,
    type ReminderOutcome,
    type SubjectKind,
} from '@/lib/constants';
import { getDatabase } from '@/lib/db/client';
import { careItems, guardians, reminderLogs, subjects } from '@/lib/db/schema';

export interface GuardianRecord {
    id: string;
    name: string;
    whatsappNumber: string;
    createdAt: string;
}

export interface SubjectRecord {
    id: string;
    guardianId: string;
    guardianName: string;
    kind: SubjectKind;
    name: string;
    species: string | null;
    createdAt: string;
}

export interface CareItemRecord {
    id: string;
    subjectId: string;
    subjectName: string;
    subjectKind: SubjectKind;
    species: string | null;
    guardianName: string;
    whatsappNumber: string;
    kind: CareItemKind;
    name: string;
    dueDate: string;
    remindDaysBefore: number;
    status: CareItemStatus;
}

export interface ReminderLogRecord {
    id: string;
    careItemId: string;
    sentAt: string;
    kapsoMessageId: string | null;
    outcome: ReminderOutcome;
    errorMessage: string | null;
}

export async function listGuardians(): Promise<GuardianRecord[]> {
    const database = await getDatabase();
    const rows = await database.select().from(guardians).orderBy(asc(guardians.name));
    return rows;
}

export async function findGuardianByPhone(whatsappNumber: string): Promise<GuardianRecord | null> {
    const database = await getDatabase();
    const rows = await database
        .select()
        .from(guardians)
        .where(eq(guardians.whatsappNumber, whatsappNumber))
        .limit(1);

    return rows[0] ?? null;
}

export async function insertGuardian({
    name,
    whatsappNumber,
}: {
    name: string;
    whatsappNumber: string;
}): Promise<GuardianRecord> {
    const database = await getDatabase();
    const record: GuardianRecord = {
        id: crypto.randomUUID(),
        name,
        whatsappNumber,
        createdAt: new Date().toISOString(),
    };

    await database.insert(guardians).values(record);
    return record;
}

export async function listSubjects(): Promise<SubjectRecord[]> {
    const database = await getDatabase();
    const rows = await database
        .select({
            id: subjects.id,
            guardianId: subjects.guardianId,
            guardianName: guardians.name,
            kind: subjects.kind,
            name: subjects.name,
            species: subjects.species,
            createdAt: subjects.createdAt,
        })
        .from(subjects)
        .innerJoin(guardians, eq(subjects.guardianId, guardians.id))
        .orderBy(asc(guardians.name), asc(subjects.name));

    return rows.flatMap((row) => {
        const kind = asSubjectKind(row.kind);
        if (!kind) {
            return [];
        }

        return [{ ...row, kind }];
    });
}

export async function findSubjectByIdentity({
    guardianId,
    kind,
    name,
}: {
    guardianId: string;
    kind: SubjectKind;
    name: string;
}): Promise<SubjectRecord | null> {
    const normalizedName = name.trim().toLocaleLowerCase('pt-BR');
    const matches = await listSubjects();

    return (
        matches.find(
            (subject) =>
                subject.guardianId === guardianId &&
                subject.kind === kind &&
                subject.name.trim().toLocaleLowerCase('pt-BR') === normalizedName,
        ) ?? null
    );
}

export async function insertSubject({
    guardianId,
    kind,
    name,
    species,
}: {
    guardianId: string;
    kind: SubjectKind;
    name: string;
    species: string | null;
}): Promise<string> {
    const database = await getDatabase();
    const id = crypto.randomUUID();

    await database.insert(subjects).values({
        id,
        guardianId,
        kind,
        name,
        species,
        createdAt: new Date().toISOString(),
    });

    return id;
}

export async function listCareItems(): Promise<CareItemRecord[]> {
    const database = await getDatabase();
    const rows = await database
        .select({
            id: careItems.id,
            subjectId: careItems.subjectId,
            subjectName: subjects.name,
            subjectKind: subjects.kind,
            species: subjects.species,
            guardianName: guardians.name,
            whatsappNumber: guardians.whatsappNumber,
            kind: careItems.kind,
            name: careItems.name,
            dueDate: careItems.dueDate,
            remindDaysBefore: careItems.remindDaysBefore,
            status: careItems.status,
        })
        .from(careItems)
        .innerJoin(subjects, eq(careItems.subjectId, subjects.id))
        .innerJoin(guardians, eq(subjects.guardianId, guardians.id))
        .orderBy(asc(careItems.dueDate), asc(subjects.name));

    return rows.flatMap((row) => {
        const subjectKind = asSubjectKind(row.subjectKind);
        const kind = asCareItemKind(row.kind);
        const status = asCareItemStatus(row.status);

        if (!subjectKind || !kind || !status) {
            return [];
        }

        return [{ ...row, subjectKind, kind, status }];
    });
}

export async function insertCareItem({
    subjectId,
    kind,
    name,
    dueDate,
    remindDaysBefore,
}: {
    subjectId: string;
    kind: CareItemKind;
    name: string;
    dueDate: string;
    remindDaysBefore: number;
}): Promise<string> {
    const database = await getDatabase();
    const id = crypto.randomUUID();

    await database.insert(careItems).values({
        id,
        subjectId,
        kind,
        name,
        dueDate,
        remindDaysBefore,
        status: 'pending',
        createdAt: new Date().toISOString(),
    });

    return id;
}

export async function markCareItemReminded(careItemId: string): Promise<void> {
    const database = await getDatabase();
    await database.update(careItems).set({ status: 'reminded' }).where(eq(careItems.id, careItemId));
}

export async function listLatestLogs(careItemIds: string[]): Promise<Map<string, ReminderLogRecord>> {
    const latest = new Map<string, ReminderLogRecord>();

    if (careItemIds.length === 0) {
        return latest;
    }

    const database = await getDatabase();
    const rows = await database
        .select()
        .from(reminderLogs)
        .where(inArray(reminderLogs.careItemId, careItemIds))
        .orderBy(desc(reminderLogs.sentAt));

    for (const row of rows) {
        const outcome = asReminderOutcome(row.outcome);
        if (!outcome || latest.has(row.careItemId)) {
            continue;
        }

        latest.set(row.careItemId, { ...row, outcome });
    }

    return latest;
}

export async function findLatestLog(careItemId: string): Promise<ReminderLogRecord | null> {
    const latest = await listLatestLogs([careItemId]);
    return latest.get(careItemId) ?? null;
}

export async function insertReminderLog({
    careItemId,
    kapsoMessageId,
    outcome,
    errorMessage,
}: {
    careItemId: string;
    kapsoMessageId: string | null;
    outcome: ReminderOutcome;
    errorMessage: string | null;
}): Promise<void> {
    const database = await getDatabase();

    await database.insert(reminderLogs).values({
        id: crypto.randomUUID(),
        careItemId,
        sentAt: new Date().toISOString(),
        kapsoMessageId,
        outcome,
        errorMessage,
    });
}

function asSubjectKind(value: string): SubjectKind | null {
    return subjectKinds.find((kind) => kind === value) ?? null;
}

function asCareItemKind(value: string): CareItemKind | null {
    return careItemKinds.find((kind) => kind === value) ?? null;
}

function asCareItemStatus(value: string): CareItemStatus | null {
    return careItemStatuses.find((status) => status === value) ?? null;
}

function asReminderOutcome(value: string): ReminderOutcome | null {
    return reminderOutcomes.find((outcome) => outcome === value) ?? null;
}
