
const HARDCODED_KEY = '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';
const model = 'google/gemini-2.0-flash-exp:free';

async function testKey() {
    console.log(`Testing Hardcoded Key with model: ${model}...`);
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HARDCODED_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'LaunchPact AI Test'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Say hello' }],
                max_tokens: 10
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Key works! Response: ${data.choices[0].message.content}`);
        } else {
            const error = await response.json().catch(() => ({}));
            console.log(`❌ Key failed: ${response.status} - ${JSON.stringify(error)}`);
        }
    } catch (err) {
        console.log(`❌ Error: ${err.message}`);
    }
}

testKey();
