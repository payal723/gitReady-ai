import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY?.trim();
const genAI = new GoogleGenerativeAI(apiKey || "");

async function generateContent(prompt) {
    if (!apiKey) return null;
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro"];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            if (text) return text;
        } catch (error) {
            continue;
        }
    }
    return null;
}

export async function getAICommitMessage(diff) {
    const prompt = `You are an expert software engineer. Analyze this git diff and write a single Git commit message.

STRICT RULES:
- Format: <type>(<scope>): <short description>
- Allowed types: feat, fix, refactor, docs, style, test, chore, perf
- scope = the main file or module changed (e.g., readme, auth, cli, scanner)
- description: max 72 chars, imperative mood ("add" not "added"), lowercase
- If changes are complex, add ONE blank line then 2-3 bullet points explaining WHY
- Be SPECIFIC — mention actual function names, file names, or features changed
- NO generic phrases like "update files", "fix bug", "make changes"

GOOD examples:
  feat(cli): add interactive model selection before commit
  fix(readme): replace appendFile with section-aware changelog update
  refactor(ai): strengthen prompts with explicit rules and examples
  docs(readme): add changelog section with dated entries

BAD examples (never do this):
  update files
  fix bug
  changes made
  minor improvements

Git diff to analyze:
\`\`\`
${diff.slice(0, 4000)}
\`\`\`

Respond with ONLY the commit message. No explanation, no markdown formatting, no quotes.`;

    const result = await generateContent(prompt);
    return result ? result.replace(/^['"`]+|['"`]+$/g, "").trim() : null;
}

export async function getAIReadmeSummary(diff) {
    const prompt = `You are a technical writer updating a project changelog.

Analyze this git diff and write a changelog entry as markdown bullet points.

STRICT RULES:
- Start every bullet with "- "
- Be specific: mention actual file names, function names, or feature names
- Use past tense: "Added", "Fixed", "Removed", "Refactored", "Improved"
- Max 5 bullets
- NO generic phrases like "various improvements", "minor fixes", "updated code"
- If a function was renamed or logic was changed, say exactly what

GOOD example output:
- Refactored \`readme.js\` to maintain a persistent Changelog section instead of appending duplicates
- Improved commit message prompt in \`ai.js\` with explicit Conventional Commits rules and examples
- Added manual fallback input when AI summary generation fails
- Fixed \`generateContent()\` to return null on empty response instead of throwing

BAD example output:
- Updated various files
- Fixed some bugs
- Made improvements to the codebase

Git diff:
\`\`\`
${diff.slice(0, 4000)}
\`\`\`

Respond with ONLY the bullet points. No heading, no explanation, no intro line.`;

    return await generateContent(prompt);
}


export async function getFullProjectReadme(diff) {
    const prompt = `
        You are a World-Class Open Source Maintainer. 
        Analyze the following code changes and project structure to generate a TOP-TIER README.md.
        
        The README MUST include:
        1. 🚀 A Catchy Project Title and a "High-Impact" Tagline.
        2. ✨ Key Features (Extract these from the code logic).
        3. 🛠️ Professional Installation Guide.
        4. 🚀 Usage instructions with code blocks.
        5. 🧰 Tech Stack (List the libraries you see in the code).
        6. 🏗️ Technical Architecture (Explain how the code is organized).
        7. 👨‍💻 Author section.

        Use professional Markdown, Badges, and Emojis. 
        Make it look like a repository that has 10k+ stars on GitHub.

        Code Context:
        ${diff.slice(0, 8000)}
    `;
    return await generateContent(prompt);
}