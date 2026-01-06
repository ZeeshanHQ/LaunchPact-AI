import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

const MODELS_TO_TEST = [
    'google/gemini-flash-1.5',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'openai/gpt-3.5-turbo'
];

async function testModel(model) {
    console.log(`Testing model: ${model}...`);
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Say hi' }],
                max_tokens: 10
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${model} works!`);
            return true;
        } else {
            const error = await response.json().catch(() => ({}));
            console.log(`❌ ${model} failed: ${response.status} - ${JSON.stringify(error)}`);
            return false;
        }
    } catch (err) {
        console.log(`❌ ${model} error: ${err.message}`);
        return false;
    }
}

async function run() {
    if (!OPENROUTER_API_KEY) {
        console.error('No API key found!');
        return;
    }
    for (const model of MODELS_TO_TEST) {
        await testModel(model);
    }
}

run();
