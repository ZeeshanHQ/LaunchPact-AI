const repairJson = (jsonStr) => {
    if (!jsonStr) return "{}";
    let cleaned = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    if (firstBrace === -1 && firstBracket === -1) {
        if (cleaned.includes(':') && !cleaned.startsWith('{')) cleaned = '{' + cleaned + '}';
        else return "{}";
    }

    let startIndex = Math.min(
        firstBrace === -1 ? cleaned.length : firstBrace,
        firstBracket === -1 ? cleaned.length : firstBracket
    );
    let result = cleaned.substring(startIndex);

    let inString = false;
    let escaped = false;
    for (let i = 0; i < result.length; i++) {
        if (result[i] === '\\' && !escaped) {
            escaped = true;
        } else {
            if (result[i] === '"' && !escaped) inString = !inString;
            escaped = false;
        }
    }
    if (inString) result += '"';

    result = result.trim().replace(/,$/, "");

    let openBraces = (result.match(/\{/g) || []).length;
    let closeBraces = (result.match(/\}/g) || []).length;
    let openBrackets = (result.match(/\[/g) || []).length;
    let closeBrackets = (result.match(/\]/g) || []).length;

    if (openBrackets > closeBrackets) result += "]".repeat(openBrackets - closeBrackets);
    if (openBraces > closeBraces) result += "}".repeat(openBraces - closeBraces);

    return result;
};

const testCases = [
    '{"productName": "App", "features": ["one", "two', // Unterminated string
    '{"productName": "App", "features": ["one", "two"]', // Already valid
    '{"productName": "App", "features": ["one",', // Trailing comma
    '{"productName": "App"', // Missing closing brace
];

testCases.forEach(tc => {
    console.log("Input:", tc);
    const repaired = repairJson(tc);
    console.log("Repaired:", repaired);
    try {
        JSON.parse(repaired);
        console.log("✅ Valid JSON");
    } catch (e) {
        console.log("❌ Invalid JSON:", e.message);
    }
    console.log("---");
});
