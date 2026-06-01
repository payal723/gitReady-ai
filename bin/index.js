#!/usr/bin/env node

/**
 * GitReady AI - Entry Point
 * 
 * Workflow:
 * 1. Security Scan (.env, node_modules)
 * 2. Generate Commit Message (AI or Smart Fallback)
 * 3. Review/Edit Suggestion
 * 4. Update README (Optional & Staged)
 * 5. Final Commit Execution
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import simpleGit from 'simple-git';

// Internal Module Imports
import { runSecurityCheck } from '../src/security.js';
import { getGitDiff, commitCode } from '../src/git.js';
import { getAICommitMessage } from '../src/ai.js';
import { updateReadme } from '../src/readme.js';
import { generateFallbackCommitMessage } from '../src/fallback.js';

const currentDir = process.cwd();
const git = simpleGit(currentDir);

async function main() {
    console.log(chalk.blue.bold('\n🚀 GitReady AI is initializing...'));

    // --- PHASE 1: Security Scan ---
    // Checks for exposed .env or node_modules in .gitignore
    await runSecurityCheck(currentDir);

    // --- PHASE 2: Get Git Changes ---
    const result = await getGitDiff();

    if (result.error === 'NOT_A_REPO') {
        console.log(chalk.red('\n❌ Error: This folder is not a Git repository.'));
        console.log(chalk.yellow('Solution: Run "git init" to initialize a repository first.'));
        return;
    }

    const diff = result.diff;

    if (!diff || diff.trim() === '') {
        console.log(chalk.red('\nℹ️  No staged changes found.'));
        console.log(chalk.yellow('Solution: Use "git add ." to stage your changes before running the tool.'));
        return;
    }

    let suggestion = "";
    let isAIGenerated = false;

    // --- PHASE 3: Generate Suggestion (AI or Smart Fallback) ---
    console.log(chalk.yellow('\n🤖 Analyzing your changes...'));

    try {
        suggestion = await getAICommitMessage(diff);
        isAIGenerated = true;
    } catch (error) {
        // Switching to Smart Fallback if AI/Internet is down
        suggestion = generateFallbackCommitMessage(diff);
        isAIGenerated = false;
        console.log(chalk.gray('ℹ️  AI is offline. Using smart fallback generator.'));
    }

    // --- PHASE 4: Review and Edit Suggestion ---
    const { finalMessage } = await inquirer.prompt([
        {
            type: 'input',
            name: 'finalMessage',
            message: isAIGenerated ? chalk.cyan('AI Suggestion:') : chalk.yellow('Smart Suggestion:'),
            default: suggestion,
            validate: input => input.trim() !== '' || 'Commit message cannot be empty.'
        }
    ]);

    // --- PHASE 5: Optional README Update ---
    const { confirmReadmeUpdate } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmReadmeUpdate',
            message: 'Would you like to update README.md with these changes?',
            default: true
        }
    ]);

    if (confirmReadmeUpdate) {
        try {
            console.log(chalk.yellow('\n📝 Updating README...'));
            await updateReadme(currentDir, diff);
            
            // We must stage the README so it is included in the commit
            await git.add('README.md');
            console.log(chalk.green('✅ README.md updated and staged.'));
        } catch (error) {
            console.log(chalk.red('⚠️  Failed to update README automatically. skipping...'));
        }
    }

    // --- PHASE 6: Final Confirmation & Execution ---
    const { confirmFinalCommit } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmFinalCommit',
            message: 'Ready to commit all changes?',
            default: true
        }
    ]);

    if (!confirmFinalCommit) {
        console.log(chalk.gray('\nCommit process cancelled by user.'));
        return;
    }

    try {
        await commitCode(finalMessage);
        console.log(chalk.green.bold('\n🚀 Success: Everything committed successfully!'));
    } catch (err) {
        console.error(chalk.red('\n❌ Git Commit Failed:'), err.message);
    }
}

/**
 * Global Error Handling
 */
main().catch(error => {
    console.error(chalk.red('\n❌ Unexpected System Error:'), error.message);
});