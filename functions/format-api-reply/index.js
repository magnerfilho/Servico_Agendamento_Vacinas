async function handler(request, env) {
    const payload = await request.json();
    const vars = payload?.execution_context?.vars ?? {};
    const message = extractMessage(vars.api_result) || 'Não consegui concluir agora. Tente de novo em instantes.';

    return jsonResponse({
        vars: {
            reply_text: message,
        },
    });
}

function jsonResponse(body) {
    return new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
    });
}

function extractMessage(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }

        try {
            return extractMessage(JSON.parse(trimmed));
        } catch {
            return trimmed;
        }
    }

    if (typeof value === 'object') {
        if (typeof value.message === 'string' && value.message.trim()) {
            return value.message.trim();
        }

        if (value.body) {
            return extractMessage(value.body);
        }

        if (value.data) {
            return extractMessage(value.data);
        }

        if (value.response) {
            return extractMessage(value.response);
        }
    }

    return null;
}
