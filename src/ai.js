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

// Use only the model that currently works for your project
const MODEL = "gemini-2.5-flash";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateContent(prompt) {
    const model = genAI.getGenerativeModel({
        model: MODEL
    });

    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            lastError = error;

            const isRetryable =
                error?.message?.includes("503") ||
                error?.message?.includes("429");

            if (isRetryable && attempt < 3) {
                console.log(
                    `⚠️ AI busy (attempt ${attempt}/3). Retrying in 5 seconds...`
                );

                await sleep(5000);
                continue;
            }

            break;
        }
    }

    throw lastError;
}

/**
 * Generate AI Commit Message
 */
export async function getAICommitMessage(diff) {
    const safeDiff = diff.slice(0, 10000);

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
- Maximum 60 characters

Git Diff:
${safeDiff}
`;

    const response = await generateContent(prompt);

    return response
        .replace(/^["']|["']$/g, "")
        .trim();
}

/**
 * Generate README changelog summary
 */
export async function getAIReadmeSummary(diff) {
    const safeDiff = diff.slice(0, 10000);

    const prompt = `
Act as a technical writer.

Create ONE concise bullet point describing
these changes for a README changelog.

Changes:
${safeDiff}
`;

    return await generateContent(prompt);
}

/**
 * Generate Full README.md
 */
export async function getInitialReadmeContent(diff) {
    const safeDiff = diff.slice(0, 10000);

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
${safeDiff}
`;

    return await generateContent(prompt);
}