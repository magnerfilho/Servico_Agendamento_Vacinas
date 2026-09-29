async function handler(request, env) {
    const payload = await request.json();
    const executionContext = payload?.execution_context ?? {};
    const vars = executionContext.vars ?? {};
    const availableEdges = Array.isArray(payload?.available_edges) ? payload.available_edges : [];
    const choices = collectChoices(vars);

    for (const choice of choices) {
        const mapped = mapChoice(choice);
        if (mapped && availableEdges.includes(mapped)) {
            return jsonResponse({ next_edge: mapped });
        }
    }

    return jsonResponse({
        next_edge: availableEdges[0] || 'next',
        vars: {
            decision_reason: {
                choices,
                available_edges: availableEdges,
            },
        },
    });
}

function jsonResponse(body) {
    return new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
    });
}

function collectChoices(value) {
    const found = [];
    walk(value, found);
    return found;
}

function walk(value, found) {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
            found.push(trimmed);
        }
        return;
    }

    if (!value || typeof value !== 'object') {
        return;
    }

    const direct = value.id || value.button_id || value.buttonId || value.list_id || value.listId || value.title;
    if (typeof direct === 'string' && direct.trim()) {
        found.push(direct.trim());
    }

    const textBody = value.text && typeof value.text === 'object' ? value.text.body : null;
    if (typeof textBody === 'string' && textBody.trim()) {
        found.push(textBody.trim());
    }

    for (const nested of Object.values(value)) {
        if (nested && typeof nested === 'object') {
            walk(nested, found);
        }
    }
}

function mapChoice(extracted) {
    const normalized = extracted
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const aliases = {
        register: 'register',
        cadastrar: 'register',
        cadastro: 'register',
        upcoming: 'upcoming',
        proximos: 'upcoming',
        proximo: 'upcoming',
        person: 'person',
        pessoa: 'person',
        pet: 'pet',
        vaccine: 'vaccine',
        vacina: 'vaccine',
        medication: 'medication',
        medicamento: 'medication',
        remedio: 'medication',
    };

    return aliases[normalized] || null;
}
