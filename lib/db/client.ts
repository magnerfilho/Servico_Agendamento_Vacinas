import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '@/lib/db/schema';

export type AppDatabase = LibSQLDatabase<typeof schema>;

const globalDatabase = globalThis as typeof globalThis & {
    appDatabase?: AppDatabase;
};

export async function getDatabase(): Promise<AppDatabase> {
    if (globalDatabase.appDatabase) {
        return globalDatabase.appDatabase;
    }

    const dataDirectory = path.join(process.cwd(), 'data');
    mkdirSync(dataDirectory, { recursive: true });

    const client = createClient({ url: 'file:data/app.db' });
    await initializeSchema(client);

    const database = drizzle(client, { schema });
    globalDatabase.appDatabase = database;
    return database;
}

async function initializeSchema(client: Client): Promise<void> {
    await client.execute('PRAGMA foreign_keys = ON');

    await client.execute(`
        CREATE TABLE IF NOT EXISTS guardians (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            whatsapp_number TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        )
    `);

    await client.execute(`
        CREATE TABLE IF NOT EXISTS subjects (
            id TEXT PRIMARY KEY,
            guardian_id TEXT NOT NULL REFERENCES guardians(id),
            kind TEXT NOT NULL,
            name TEXT NOT NULL,
            species TEXT,
            created_at TEXT NOT NULL
        )
    `);

    await client.execute(`
        CREATE TABLE IF NOT EXISTS care_items (
            id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL REFERENCES subjects(id),
            kind TEXT NOT NULL,
            name TEXT NOT NULL,
            due_date TEXT NOT NULL,
            remind_days_before INTEGER NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    await client.execute(`
        CREATE TABLE IF NOT EXISTS reminder_logs (
            id TEXT PRIMARY KEY,
            care_item_id TEXT NOT NULL REFERENCES care_items(id),
            sent_at TEXT NOT NULL,
            kapso_message_id TEXT,
            outcome TEXT NOT NULL,
            error_message TEXT
        )
    `);
}
