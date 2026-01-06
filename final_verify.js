async function verifyBlueprint() {
    const payload = {
        rawIdea: "A solar-powered automated garden irrigation system with mobile app control."
    };

    console.log("Sending request to /api/generate-blueprint...");

    try {
        const response = await fetch('http://localhost:3000/api/generate-blueprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Success! Blueprint forged for:", data.productName);
            console.log("Tagline:", data.tagline);
            process.exit(0);
        } else {
            const error = await response.json().catch(() => ({}));
            console.error("❌ Failed with status:", response.status);
            console.error("Error Details:", JSON.stringify(error, null, 2));
            process.exit(1);
        }
    } catch (err) {
        console.error("❌ Network or connection error:", err.message);
        process.exit(1);
    }
}

verifyBlueprint();
