const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function test() {
    // 1. Get API Key
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        try {
            const envPath = path.join(process.cwd(), '.env.local');
            if (fs.existsSync(envPath)) {
                const content = fs.readFileSync(envPath, 'utf8');
                const match = content.match(/GEMINI_API_KEY=(.+)/);
                if (match) apiKey = match[1].trim();
            }
        } catch (e) {
            console.error("Error reading .env.local:", e);
        }
    }

    if (!apiKey) {
        console.error("PADON: No GEMINI_API_KEY found.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log(`Testing models with key: ${apiKey.substring(0, 4)}...`);

    for (const modelName of modelsToTry) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}`);
            console.log(`Response: ${response.text()}`);
            break; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED ${modelName}: ${error.message}`);
        }
    }
}

test();
