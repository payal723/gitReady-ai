🚀 GitReady AI

**Transform your messy Git workflow into professional documentation with the power of Google Gemini AI.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

GitReady AI is a high-performance CLI tool designed for developers who want to maintain professional version control and documentation standards without the manual overhead. It analyzes your code changes in real-time to generate context-aware commit messages and keep your project’s README synchronized.

---

## ✨ Key Features

- **🔍 Smart Security Scanner:** Automatically detects unignored sensitive files like `.env` and `node_modules` before you commit, preventing accidental data leaks.
- **🤖 AI-Powered Commits:** Analyzes your `git diff` using Google Gemini AI to suggest professional, standardized commit messages (Conventional Commits).
- **📝 Automated README Updates:** Keeps your project documentation alive by automatically appending a "Latest Updates" summary based on your actual code changes.
- **⚡ Developer Productivity:** A single command `gitready` handles security, commits, and documentation in seconds.

---

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gitready-ai.git
   cd gitready-ai
Install dependencies:
code
Bash
npm install
Link the tool globally:
code
Bash
npm link
⚙️ Configuration
Create a .env file in the project root:
code
Env
GEMINI_API_KEY=your_google_gemini_api_key_here
Get your free API key from Google AI Studio.
🚀 How to Use
Simply run the tool in any Git repository after staging your changes:
code
Bash
# 1. Stage your changes
git add .

# 2. Run the magic
gitready
Workflow:
Security Check: The tool scans for exposed secrets.
AI Analysis: Gemini AI reads your code changes.
README Sync: Choose to update your documentation automatically.
Instant Commit: Confirm the AI-generated message to commit your work.
🧠 Why I Built This?
As a developer, I realized that writing quality commit messages and keeping README files updated often takes a backseat during rapid development. I built GitReady AI to bridge this gap, ensuring that every project I work on—from simple clones to complex web apps—maintains industry-standard documentation and security.
🛠️ Technologies Used
Runtime: Node.js
AI Engine: Google Gemini AI (Generative Language API)
Git Integration: Simple-Git
Interface: Inquirer.js, Chalk, Ora (for beautiful CLI UX)
Environment Management: Dotenv
🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request to make this tool even better.
Developed with ❤️ by Payal Jat