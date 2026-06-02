import chalk from 'chalk';
import inquirer from 'inquirer';
import simpleGit from 'simple-git';

import { runSecurityCheck } from '../security.js';
import { getGitDiff, commitCode } from '../git.js';
import { getAICommitMessage } from '../ai.js';
import { updateReadme } from '../readme.js';
import { generateFallbackCommitMessage } from '../fallback.js';

const currentDir = process.cwd();
const git = simpleGit(currentDir);

export async function runCommitFlow() {
    console.log(chalk.blue.bold('\n GitReady AI: Commit Workflow Starting...'));

    await runSecurityCheck(currentDir);

    const result = await getGitDiff();

    if (result.error === 'NOT_A_REPO') {
        console.log(chalk.red('\n Error: This folder is not a Git repository.'));
        return;
    }

    const diff = result.diff;
    if (!diff || diff.trim() === '') {
        console.log(chalk.red('\n  No staged changes found. Use "git add ." first.'));
        return;
    }

    // 3. AI Analysis
    console.log(chalk.yellow('\n Analyzing your changes with AI...'));
    let suggestion = "";
    let isAIGenerated = false;

    try {
        suggestion = await getAICommitMessage(diff);
        if (suggestion) {
            isAIGenerated = true;
        } else {
            suggestion = generateFallbackCommitMessage(diff);
            isAIGenerated = false;
        }
    } catch (error) {
        suggestion = generateFallbackCommitMessage(diff);
        isAIGenerated = false;
    }

    const { finalMessage } = await inquirer.prompt([{
        type: 'input',
        name: 'finalMessage',
        message: isAIGenerated ? chalk.cyan('AI Suggestion:') : chalk.yellow('Smart Suggestion (Fallback):'),
        default: suggestion,
        validate: input => input.trim() !== '' || 'Commit message cannot be empty.'
    }]);

    const { confirmReadmeUpdate } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmReadmeUpdate',
        message: 'Would you like to update README.md with these changes?',
        default: true
    }]);

    if (confirmReadmeUpdate) {
        console.log(chalk.yellow(' Updating README...'));
        const success = await updateReadme(currentDir, diff);
        if (success) {
            await git.add('README.md');
            console.log(chalk.green(' README.md updated and staged.'));
        }
    }

    const { confirmFinalCommit } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmFinalCommit',
        message: 'Ready to commit all staged changes?',
        default: true
    }]);

    if (confirmFinalCommit) {
        await commitCode(finalMessage);
        console.log(chalk.green.bold('\n Success: Everything committed successfully!'));
    } else {
        console.log(chalk.gray('\nCommit process cancelled by user.'));
    }
}