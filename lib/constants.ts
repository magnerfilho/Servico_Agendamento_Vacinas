// Número já ligado ao fluxo Kapso deste projeto.
export const WHATSAPP_PHONE_NUMBER_ID = '1283185134887856';

export const REMINDER_TEMPLATE_NAME = 'lembrete_vencimento';

export const REMINDER_TEMPLATE_LANGUAGE = 'pt_BR';

// Antecedência padrão do lembrete, em dias, antes do vencimento.
export const DEFAULT_REMIND_DAYS_BEFORE = 3;

// Limite do campo de antecedência no cadastro.
export const MAX_REMIND_DAYS_BEFORE = 365;

export const APP_TIME_ZONE = 'America/Sao_Paulo';

// Checagem de lembretes enquanto o servidor está ligado (1 hora).
export const REMINDER_CHECK_INTERVAL_MS = 3_600_000;

// WhatsApp em dígitos, com DDI, sem o sinal de mais.
export const MIN_PHONE_DIGITS = 10;
export const MAX_PHONE_DIGITS = 15;

// Quantidade de itens na resposta "Ver próximos" do WhatsApp.
export const MAX_UPCOMING_ITEMS = 10;

export const DEFAULT_GUARDIAN_NAME = 'Responsável';

export const subjectKinds = ['person', 'pet'] as const;
export type SubjectKind = (typeof subjectKinds)[number];

export const careItemKinds = ['vaccine', 'medication'] as const;
export type CareItemKind = (typeof careItemKinds)[number];

export const careItemStatuses = ['pending', 'reminded'] as const;
export type CareItemStatus = (typeof careItemStatuses)[number];

export const reminderOutcomes = ['success', 'error'] as const;
export type ReminderOutcome = (typeof reminderOutcomes)[number];
