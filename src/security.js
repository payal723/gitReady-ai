// src/security.js

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function runSecurityCheck(currentDir) {
    const gitIgnorePath = path.join(currentDir, '.gitignore');

    const envExists =
        await fs.pathExists(path.join(currentDir, '.env'));

    const nodeModulesExists =
        await fs.pathExists(
            path.join(currentDir, 'node_modules')
        );

    let missingEntries = [];

    let gitIgnoreContent = '';

    if (await fs.pathExists(gitIgnorePath)) {
        gitIgnoreContent = await fs.readFile(
            gitIgnorePath,
            'utf8'
        );
    }

    // Check .env
    if (
        envExists &&
        !gitIgnoreContent.includes('.env')
    ) {
        missingEntries.push('.env');
    }

    // Check node_modules
    if (
        nodeModulesExists &&
        !gitIgnoreContent.includes('node_modules')
    ) {
        missingEntries.push('node_modules');
    }

    if (missingEntries.length === 0) {
        console.log(
            chalk.green(
                ' Security Check Passed.'
            )
        );

        return {
            success: true,
            updated: false
        };
    }

    console.log(
        chalk.yellow(
            ` Security Alert: ${missingEntries.join(', ')} not found in .gitignore`
        )
    );

    const { fixIgnore } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'fixIgnore',
            message: `Add ${missingEntries.join(
                ' and '
            )} to .gitignore?`,
            default: true
        }
    ]);

    if (!fixIgnore) {
        console.log(
            chalk.yellow(
                ' Security recommendations skipped.'
            )
        );

        return {
            success: true,
            updated: false
        };
    }

    const entriesToAdd = [
        '',
        '# Added by GitReady AI',
        ...missingEntries
    ].join('\n');

    if (await fs.pathExists(gitIgnorePath)) {
        await fs.appendFile(
            gitIgnorePath,
            `\n${entriesToAdd}\n`
        );
    } else {
        await fs.writeFile(
            gitIgnorePath,
            `${entriesToAdd}\n`
        );
    }

    console.log(
        chalk.green(
            '.gitignore updated successfully.'
        )
    );

    return {
        success: true,
        updated: true,
        added: missingEntries
    };
}