export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
        return;
    }

    const { startReminderScheduler } = await import('@/lib/reminders/scheduler');
    startReminderScheduler();
}
