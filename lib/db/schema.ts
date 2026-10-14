import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const guardians = sqliteTable('guardians', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    whatsappNumber: text('whatsapp_number').notNull().unique(),
    createdAt: text('created_at').notNull(),
});

export const subjects = sqliteTable('subjects', {
    id: text('id').primaryKey(),
    guardianId: text('guardian_id')
        .notNull()
        .references(() => guardians.id),
    kind: text('kind').notNull(),
    name: text('name').notNull(),
    species: text('species'),
    createdAt: text('created_at').notNull(),
});

export const careItems = sqliteTable('care_items', {
    id: text('id').primaryKey(),
    subjectId: text('subject_id')
        .notNull()
        .references(() => subjects.id),
    kind: text('kind').notNull(),
    name: text('name').notNull(),
    dueDate: text('due_date').notNull(),
    remindDaysBefore: integer('remind_days_before').notNull(),
    remindTime: text('remind_time').notNull(),
    status: text('status').notNull(),
    createdAt: text('created_at').notNull(),
});

export const loginCodes = sqliteTable('login_codes', {
    id: text('id').primaryKey(),
    guardianId: text('guardian_id')
        .notNull()
        .references(() => guardians.id),
    codeHash: text('code_hash').notNull(),
    expiresAt: text('expires_at').notNull(),
    attempts: integer('attempts').notNull(),
    consumedAt: text('consumed_at'),
    createdAt: text('created_at').notNull(),
});

export const reminderLogs = sqliteTable('reminder_logs', {
    id: text('id').primaryKey(),
    careItemId: text('care_item_id')
        .notNull()
        .references(() => careItems.id),
    sentAt: text('sent_at').notNull(),
    kapsoMessageId: text('kapso_message_id'),
    outcome: text('outcome').notNull(),
    errorMessage: text('error_message'),
});
