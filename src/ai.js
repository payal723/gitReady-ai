import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

// FIXED: Using "gemini-1.5-flash" (2.5 does not exist)
const MODEL = "gemini-1.5-flash";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateContent(prompt) {
    // Standardizing the model retrieval
    const model = genAI.getGenerativeModel({ model: MODEL });

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            if (text) return text;
        } catch (error) {
            const message = error?.message || "";
            const isRetryable = message.includes("503") || message.includes("429") || message.includes("Service Unavailable");

            if (isRetryable && attempt < 3) {
                console.log(`\x1b[33m AI busy (attempt ${attempt}/3). Retrying in 3 seconds...\x1b[0m`);
                await sleep(3000);
                continue;
            }
            return null;
        }
    }
    return null;
}

export async function getAICommitMessage(diff) {
    const safeDiff = diff.slice(0, 5000); // 5000 is enough for a commit message
    const prompt = `Analyze this git diff and generate a concise Conventional Commit message (max 60 chars). Output ONLY the message:\n\n${safeDiff}`;
    return await generateContent(prompt);
}

export async function getAIReadmeSummary(diff) {
    const safeDiff = diff.slice(0, 5000);
    const prompt = `Act as a technical writer. Summarize these code changes into ONE concise bullet point for a README changelog:\n\n${safeDiff}`;
    return await generateContent(prompt);
}

export async function getInitialReadmeContent(diff) {
    const safeDiff = diff.slice(0, 8000);
    const prompt = `Write a professional README.md for this project based on the following code changes. Include Title, Description, Features, Installation, Usage, and Technologies. Use professional markdown formatting:\n\n${safeDiff}`;
    return await generateContent(prompt);
}