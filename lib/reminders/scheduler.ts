import { REMINDER_CHECK_INTERVAL_MS } from '@/lib/constants';

const DEFAULT_DEV_PORT = '3000';
// O instrumentation dispara antes do servidor aceitar conexões.
const STARTUP_DELAY_MS = 2_000;

const globalState = globalThis as typeof globalThis & {
    reminderSchedulerStarted?: boolean;
};

export function startReminderScheduler(): void {
    if (globalState.reminderSchedulerStarted) {
        return;
    }

    globalState.reminderSchedulerStarted = true;
    setTimeout(() => {
        void runReminderJob();
    }, STARTUP_DELAY_MS);
    setInterval(() => {
        void runReminderJob();
    }, REMINDER_CHECK_INTERVAL_MS);
}

async function runReminderJob(): Promise<void> {
    const port = process.env.PORT || DEFAULT_DEV_PORT;
    const headers: Record<string, string> = {};
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET;

    if (secret) {
        headers['x-reminder-token'] = secret;
    }

    try {
        await fetch(`http://127.0.0.1:${port}/api/jobs/send-reminders`, {
            method: 'POST',
            headers,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Falha ao chamar o job de lembretes.';
        console.error(message);
    }
}
