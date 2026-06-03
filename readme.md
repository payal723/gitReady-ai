GitReady AI
GitReady AI is a production-grade CLI utility designed to automate the most tedious parts of a developer's workflow: writing professional commit messages, generating project documentation, and auditing repository security—all powered by Google Gemini AI.
![alt text](https://img.shields.io/npm/v/@payal-jat/gitready-ai.svg?style=flat-square)

![alt text](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
🛠 Installation
You can install GitReady AI globally via npm:
code
Bash
$ npm install -g @payal-jat/gitready-ai
⚙️ Configuration
Before running the tool, you need a Google Gemini API Key.
Get your free key from Google AI Studio.
Create a .env file in your project root or set a global environment variable:
code
Env
GEMINI_API_KEY=your_api_key_here
🚀 Usage
GitReady AI provides a suite of commands to handle your development cycle.
1. Smart Commits & Documentation
Analyze your staged changes, generate a professional commit message, and update your README automatically.
code
Bash
$ git add .
$ gitready commit
How it works:
AI Analysis: Reads your git diff to understand the logic of your changes.
Commit Suggestion: Suggests a Conventional Commit (e.g., feat: add user auth).
README Sync: Architectures a full README (if missing) or appends a summary of changes.
2. Repository Security Audit
Scan your repository for leaked secrets and get a "Repo Health Score."
code
Bash
$ gitready audit
What it checks:
Secret Leaks: Scans for AWS Keys, GitHub Tokens, and Private Keys.
Missing Docs: Checks if README.md or .gitignore are missing.
Health Score: Gives you a score out of 100 based on best practices.
🧰 Technical Architecture
This tool is built with a Modular Command Pattern, ensuring scalability and performance:
AI Engine: Google Gemini 1.5 Flash.
Git Interface: simple-git for seamless repository interaction.
Security Engine: Custom Regex-based deep scanner.
UX: Interactive prompts via inquirer and styled terminal output with chalk.
📝 Example Output
Command: gitready commit
code
Text
🤖 AI Analyzing changes...
✨ AI Suggestion: "feat: implement modular command architecture for CLI"
? Would you like to update README.md with these changes? Yes
✅ README.md updated and staged.
? Ready to commit all changes? Yes
🚀 Success: Everything committed successfully!
👨‍💻 Author
Developed by Payal Jat
Feel free to contribute or reach out for suggestions!
