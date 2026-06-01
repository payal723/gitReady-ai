#!/usr/bin/env node

/**
 * GitReady AI - Entry Point
 * 
 * Flow:
 * 1. Security Scan
 * 2. Get AI Commit Suggestion
 * 3. Update README (If requested) & Stage it
 * 4. Final Commit
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import simpleGit from 'simple-git'; 
import { runSecurityCheck } from '../src/security.js';
import { getGitDiff, commitCode } from '../src/git.js';
import { getAICommitMessage } from '../src/ai.js';
import { updateReadme } from '../src/readme.js';

const currentDir = process.cwd();
const git = simpleGit(currentDir);

async function main() {
    console.log(chalk.blue.bold('\n GitReady AI is initializing...'));

    // PHASE 1: Security Scan
    await runSecurityCheck(currentDir);

    // PHASE 2: Get Changes
    const result = await getGitDiff();

    if (result.error === 'NOT_A_REPO') {
        console.log(chalk.red('\n Error: This folder is not a Git Repository.'));
        console.log(chalk.yellow('Solution: Please run "git init" first.'));
        return;
    }

    const diff = result.diff;
    if (!diff || diff.trim() === '') {
        console.log(chalk.red('\n  No staged changes found.'));
        console.log(chalk.yellow('Solution: Use "git add ." to stage your changes.'));
        return;
    }

    // PHASE 3: AI Analysis
    console.log(chalk.yellow('\n AI is analyzing your changes...'));
    
    try {
        const message = await getAICommitMessage(diff);
        console.log(chalk.cyan.bold('\n✨ AI Suggestion: ') + chalk.white(`"${message}"`));

        // STEP 1: Ask about README before committing
        const { confirmReadmeUpdate } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmReadmeUpdate',
            message: 'Should I update your README.md with these changes before committing?',
            default: true
        }]);

        if (confirmReadmeUpdate) {
            console.log(chalk.yellow(' Updating README...'));
            await updateReadme(currentDir, diff);
            
            await git.add('README.md'); 
            console.log(chalk.green(' README.md updated and staged.'));
        }

        const { confirmFinalCommit } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmFinalCommit',
            message: 'Ready to commit everything now?',
            default: true
        }]);

        if (confirmFinalCommit) {
            await commitCode(message);
            console.log(chalk.green(' Success: Everything committed successfully!'));
        } else {
            console.log(chalk.gray('Commit process cancelled by the user.'));
        }

    } catch (error) {
        console.error(chalk.red('\n AI Workflow Error:'), error.message);
    }
}

main().catch(err => {
    console.error(chalk.red('\n Unexpected Error:'), err);
});