// Número já ligado ao fluxo Kapso deste projeto.
export const WHATSAPP_PHONE_NUMBER_ID = '1283185134887856';

export const REMINDER_TEMPLATE_NAME = 'lembrete_vencimento';

export const REMINDER_TEMPLATE_LANGUAGE = 'pt_BR';

// Antecedência padrão do lembrete, em dias, antes do vencimento.
export const DEFAULT_REMIND_DAYS_BEFORE = 3;

// Horário padrão do alerta, no fuso de Brasília (HH:MM).
export const DEFAULT_REMIND_TIME = '09:00';

// Limite do campo de antecedência no cadastro.
export const MAX_REMIND_DAYS_BEFORE = 365;

export const APP_TIME_ZONE = 'America/Sao_Paulo';

// Conferência da fila enquanto o servidor está ligado (1 minuto).
export const REMINDER_CHECK_INTERVAL_MS = 60_000;

// WhatsApp em dígitos, com DDI, sem o sinal de mais.
export const MIN_PHONE_DIGITS = 10;
export const MAX_PHONE_DIGITS = 15;

// País sugerido no cadastro do WhatsApp.
export const DEFAULT_PHONE_COUNTRY = 'BR';

// Celular no Brasil: DDD de 2 dígitos e número de 9 dígitos, começando com 9.
export const BRAZIL_AREA_CODE_LENGTH = 2;
export const BRAZIL_LOCAL_NUMBER_LENGTH = 9;
export const BRAZIL_MOBILE_PREFIX = '9';

// Quantidade de itens na resposta "Ver próximos" do WhatsApp.
export const MAX_UPCOMING_ITEMS = 10;

export const DEFAULT_GUARDIAN_NAME = 'Responsável';

export const LOGIN_TEMPLATE_NAME = 'codigo_acesso';

export const LOGIN_TEMPLATE_LANGUAGE = 'pt_BR';

// Dígitos do código enviado no WhatsApp.
export const LOGIN_CODE_LENGTH = 6;

// Validade do código. O template codigo_acesso declara os mesmos 10 minutos.
export const LOGIN_CODE_TTL_MS = 600_000;

// Tentativas erradas antes de invalidar o código.
export const LOGIN_CODE_MAX_ATTEMPTS = 5;

// Intervalo mínimo entre dois envios para o mesmo responsável.
export const LOGIN_CODE_RESEND_COOLDOWN_MS = 60_000;

// Sessão depois de confirmar o código (12 horas).
export const SESSION_TTL_MS = 43_200_000;

export const SESSION_COOKIE_NAME = 'guardian_session';

export const subjectKinds = ['person', 'pet'] as const;
export type SubjectKind = (typeof subjectKinds)[number];

export const careItemKinds = ['vaccine', 'medication'] as const;
export type CareItemKind = (typeof careItemKinds)[number];

export const careItemStatuses = ['pending', 'reminded'] as const;
export type CareItemStatus = (typeof careItemStatuses)[number];

export const reminderOutcomes = ['success', 'error'] as const;
export type ReminderOutcome = (typeof reminderOutcomes)[number];
