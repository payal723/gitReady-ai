// src/ai.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, "../.env")
});

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash"
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithFallback(prompt) {
    let lastError;

    for (const modelName of MODELS) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName
                });

                const result = await model.generateContent(prompt);

                return result.response.text().trim();
            } catch (error) {
                lastError = error;

                const is503 =
                    error?.message?.includes("503") ||
                    error?.message?.includes("Service Unavailable");

                if (is503 && attempt < 3) {
                    console.log(
                        ` ${modelName} busy (attempt ${attempt}/3). Retrying...`
                    );

                    await sleep(3000);
                    continue;
                }

                console.log(`⚠️ ${modelName} failed`);
console.log(error.message);
                break;
            }
        }
    }

    throw lastError;
}

export async function getAICommitMessage(diff) {
    const prompt = `
You are an expert software engineer.

Analyze the git diff and generate a concise
Conventional Commit message.

Examples:
feat: add authentication system
fix: resolve login validation issue
docs: update installation guide
refactor: simplify queue service

Rules:
- Output ONLY the commit message
- No quotes
- No markdown
- Max 60 characters

Git Diff:
${diff}
`;

    const response = await generateWithFallback(prompt);

    return response
        .replace(/^["']|["']$/g, "")
        .trim();
}

/**
 * Generate README changelog summary
 */
export async function getAIReadmeSummary(diff) {
    const prompt = `
Act as a technical writer.

Create ONE concise bullet point describing
these changes for a README changelog.

Changes:
${diff}
`;

    return await generateWithFallback(prompt);
}

/**
 * Generate full README.md
 */
export async function getInitialReadmeContent(diff) {
    const prompt = `
You are a professional technical writer.

Generate a complete README.md.

Include:

# Project Title

## Description

## Features

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

## Technologies Used

## Project Structure

## Future Improvements

Requirements:
- Professional markdown
- Infer functionality from code
- Do not invent unrealistic features

Project Code / Changes:
${diff}
`;

    return await generateWithFallback(prompt);
}