#!/usr/bin/env node

/**
 * GitReady AI - Entry Point
 *
 * Flow:
 * 1. Security Scan
 * 2. Get AI Commit Suggestion
 * 3. Update README (Optional)
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

    // Phase 1: Security Scan
    await runSecurityCheck(currentDir);

    // Phase 2: Get Git Changes
    const result = await getGitDiff();

    if (result.error === 'NOT_A_REPO') {
        console.log(chalk.red('\n Error: This folder is not a Git repository.'));
        console.log(chalk.yellow('Solution: Run "git init" first.'));
        return;
    }

    const diff = result.diff;

    if (!diff || diff.trim() === '') {
        console.log(chalk.red('\nℹ No staged changes found.'));
        console.log(chalk.yellow('Solution: Run "git add ." first.'));
        return;
    }

    let commitMessage = null;

    // Phase 3: AI Commit Message
    console.log(chalk.yellow('\n AI is analyzing your changes...'));

    try {
        commitMessage = await getAICommitMessage(diff);
    } catch (error) {
        console.log(
            chalk.yellow(
                '\n AI is unavailable. Switching to manual commit message.'
            )
        );
    }

    // Manual fallback
    if (!commitMessage) {
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'message',
                message: 'Enter your commit message:',
                validate: input =>
                    input.trim() !== '' ||
                    'Commit message cannot be empty.'
            }
        ]);

        commitMessage = answer.message;
    } else {
        console.log(
            chalk.cyan.bold('\n AI Suggestion: ') +
            chalk.white(`"${commitMessage}"`)
        );
    }

    // README update (optional)
    const { confirmReadmeUpdate } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmReadmeUpdate',
            message:
                'Would you like to update README.md before committing?',
            default: false
        }
    ]);

    if (confirmReadmeUpdate) {
        try {
            console.log(chalk.yellow('\n Updating README...'));

            await updateReadme(currentDir, diff);

            await git.add('README.md');

            console.log(
                chalk.green(' README.md updated and staged.')
            );
        } catch (error) {
            console.log(
                chalk.yellow(
                    ' README update skipped (AI unavailable).'
                )
            );
        }
    }

    // Final confirmation
    const { confirmFinalCommit } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmFinalCommit',
            message: 'Commit all staged changes now?',
            default: true
        }
    ]);

    if (!confirmFinalCommit) {
        console.log(
            chalk.gray('\nCommit process cancelled by user.')
        );
        return;
    }

    await commitCode(commitMessage);

    console.log(
        chalk.green(
            '\n Success: Everything committed successfully!'
        )
    );
}

main().catch(error => {
    console.error(
        chalk.red('\n Unexpected Error:'),
        error.message
    );
});