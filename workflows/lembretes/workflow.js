import { START, Workflow } from '@kapso/workflows';

const PHONE_NUMBER_ID = '1283185134887856';
// Cada pergunta do cadastro espera a resposta por 10 minutos.
const REPLY_WAIT_SECONDS = 600;

const appPublicUrl = (process.env.APP_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
const webhookToken = process.env.WHATSAPP_WEBHOOK_SECRET || '';

const workflow = new Workflow('lembretes', {
    name: 'Lembretes',
    status: 'active',
});

workflow.addTrigger({
    type: 'inbound_message',
    phoneNumberId: PHONE_NUMBER_ID,
    active: true,
});

workflow.addNode(START, { position: { x: 240, y: 40 } });

workflow.addNode(
    'menu',
    {
        type: 'send_interactive',
        interactiveType: 'button',
        phoneNumberId: PHONE_NUMBER_ID,
        bodyText: 'Olá! Posso cadastrar um lembrete de vacina ou medicamento, ou listar os próximos.',
        buttons: [
            { id: 'register', title: 'Cadastrar' },
            { id: 'upcoming', title: 'Próximos' },
        ],
    },
    { position: { x: 240, y: 180 } },
);

workflow.addNode(
    'wait_menu',
    {
        type: 'wait_for_response',
        saveResponseTo: 'menu_choice',
        timeoutSeconds: REPLY_WAIT_SECONDS,
    },
    { position: { x: 240, y: 320 } },
);

workflow.addNode(
    'route_menu',
    {
        type: 'decide',
        decisionType: 'function',
        functionSlug: 'route-choice',
        conditions: [
            { label: 'register', description: 'Usuário quer cadastrar um lembrete' },
            { label: 'upcoming', description: 'Usuário quer ver os próximos lembretes' },
        ],
    },
    { position: { x: 240, y: 460 } },
);

workflow.addNode(
    'ask_subject_kind',
    {
        type: 'send_interactive',
        interactiveType: 'button',
        phoneNumberId: PHONE_NUMBER_ID,
        bodyText: 'O lembrete é para uma pessoa ou para um pet?',
        buttons: [
            { id: 'person', title: 'Pessoa' },
            { id: 'pet', title: 'Pet' },
        ],
    },
    { position: { x: 40, y: 620 } },
);

workflow.addNode(
    'wait_subject_kind',
    {
        type: 'wait_for_response',
        saveResponseTo: 'subject_kind',
        timeoutSeconds: REPLY_WAIT_SECONDS,
    },
    { position: { x: 40, y: 760 } },
);

workflow.addNode(
    'route_subject',
    {
        type: 'decide',
        decisionType: 'function',
        functionSlug: 'route-choice',
        conditions: [
            { label: 'person', description: 'O lembrete é para uma pessoa' },
            { label: 'pet', description: 'O lembrete é para um pet' },
        ],
    },
    { position: { x: 40, y: 900 } },
);

workflow.addNode(
    'clear_species',
    {
        type: 'set_variable',
        variableName: 'species',
        variableValue: '',
        valueType: 'string',
    },
    { position: { x: 40, y: 1040 } },
);

workflow.addNode(
    'ask_species',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message: 'Qual a espécie do pet? Por exemplo: cão, gato.',
    },
    { position: { x: 280, y: 1040 } },
);

workflow.addNode(
    'wait_species',
    {
        type: 'wait_for_response',
        saveResponseTo: 'species',
        timeoutSeconds: REPLY_WAIT_SECONDS,
    },
    { position: { x: 280, y: 1180 } },
);

workflow.addNode(
    'ask_subject_name',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message: 'Qual o nome?',
    },
    { position: { x: 160, y: 1320 } },
);

workflow.addNode(
    'wait_subject_name',
    {
        type: 'wait_for_response',
        saveResponseTo: 'subject_name',
        timeoutSeconds: REPLY_WAIT_SECONDS,
    },
    { position: { x: 160, y: 1460 } },
);

workflow.addNode(
    'ask_item_kind',
    {
        type: 'send_interactive',
        interactiveType: 'button',
        phoneNumberId: PHONE_NUMBER_ID,
        bodyText: 'É vacina ou medicamento?',
        buttons: [
            { id: 'vaccine', title: 'Vacina' },
            { id: 'medication', title: 'Medicamento' },
        ],
    },
    { position: { x: 160, y: 1600 } },
);

workflow.addNode(
    'wait_item_kind',
    {
        type: 'wait_for_response',
        saveResponseTo: 'item_kind',
        timeoutSeconds: REPLY_WAIT_SECONDS,
    },
    { position: { x: 160, y: 1740 } },
);

workflow.addNode(
    'ask_item_name',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message: 'Qual o nome da vacina ou do medicamento?',
    },
    { position: { x: 160, y: 1880 } },
);

workflow.addNode(
    'wait_item_name',
    {
        type: 'wait_for_response',
        saveResponseTo: 'item_name',
        timeoutSeconds: REPLY_WAIT_SECONDS,
    },
    { position: { x: 160, y: 2020 } },
);

workflow.addNode(
    'ask_due_date',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message: 'Qual a data de vencimento? Responda no formato DD/MM/AAAA.',
    },
    { position: { x: 160, y: 2160 } },
);

workflow.addNode(
    'wait_due_date',
    {
        type: 'wait_for_response',
        saveResponseTo: 'due_date',
        timeoutSeconds: REPLY_WAIT_SECONDS,
    },
    { position: { x: 160, y: 2300 } },
);

workflow.addNode(
    'save_register',
    {
        type: 'webhook',
        url: `${appPublicUrl}/api/whatsapp/register`,
        method: 'POST',
        headers: webhookHeaders(),
        bodyTemplate: {
            phone: '{{context.phone_number}}',
            subjectKind: '{{vars.subject_kind}}',
            subjectName: '{{vars.subject_name}}',
            species: '{{vars.species}}',
            itemKind: '{{vars.item_kind}}',
            itemName: '{{vars.item_name}}',
            dueDate: '{{vars.due_date}}',
        },
        saveResponseTo: 'api_result',
    },
    { position: { x: 160, y: 2440 } },
);

workflow.addNode(
    'format_register',
    {
        type: 'function',
        functionSlug: 'format-api-reply',
    },
    { position: { x: 160, y: 2580 } },
);

workflow.addNode(
    'reply_register',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message: '{{vars.reply_text}}',
    },
    { position: { x: 160, y: 2720 } },
);

workflow.addNode(
    'load_upcoming',
    {
        type: 'webhook',
        url: `${appPublicUrl}/api/whatsapp/upcoming`,
        method: 'POST',
        headers: webhookHeaders(),
        bodyTemplate: {
            phone: '{{context.phone_number}}',
        },
        saveResponseTo: 'api_result',
    },
    { position: { x: 480, y: 620 } },
);

workflow.addNode(
    'format_upcoming',
    {
        type: 'function',
        functionSlug: 'format-api-reply',
    },
    { position: { x: 480, y: 760 } },
);

workflow.addNode(
    'reply_upcoming',
    {
        type: 'send_text',
        phoneNumberId: PHONE_NUMBER_ID,
        message: '{{vars.reply_text}}',
    },
    { position: { x: 480, y: 900 } },
);

workflow.addEdge(START, 'menu');
workflow.addEdge('menu', 'wait_menu');
workflow.addEdge('wait_menu', 'route_menu');
workflow.addEdge('route_menu', 'ask_subject_kind', { label: 'register' });
workflow.addEdge('route_menu', 'load_upcoming', { label: 'upcoming' });
workflow.addEdge('ask_subject_kind', 'wait_subject_kind');
workflow.addEdge('wait_subject_kind', 'route_subject');
workflow.addEdge('route_subject', 'clear_species', { label: 'person' });
workflow.addEdge('route_subject', 'ask_species', { label: 'pet' });
workflow.addEdge('clear_species', 'ask_subject_name');
workflow.addEdge('ask_species', 'wait_species');
workflow.addEdge('wait_species', 'ask_subject_name');
workflow.addEdge('ask_subject_name', 'wait_subject_name');
workflow.addEdge('wait_subject_name', 'ask_item_kind');
workflow.addEdge('ask_item_kind', 'wait_item_kind');
workflow.addEdge('wait_item_kind', 'ask_item_name');
workflow.addEdge('ask_item_name', 'wait_item_name');
workflow.addEdge('wait_item_name', 'ask_due_date');
workflow.addEdge('ask_due_date', 'wait_due_date');
workflow.addEdge('wait_due_date', 'save_register');
workflow.addEdge('save_register', 'format_register');
workflow.addEdge('format_register', 'reply_register');
workflow.addEdge('load_upcoming', 'format_upcoming');
workflow.addEdge('format_upcoming', 'reply_upcoming');

function webhookHeaders() {
    if (!webhookToken) {
        return {};
    }

    return { 'x-reminder-token': webhookToken };
}

export default workflow;
