import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function runSecurityCheck(currentDir) {
    const gitIgnorePath = path.join(currentDir, '.gitignore');
    const envExists = await fs.pathExists(path.join(currentDir, '.env'));
    const nodeModulesExists = await fs.pathExists(path.join(currentDir, 'node_modules'));

    let needsUpdate = false;
    let missingEntries = [];

    // Check what is missing from .gitignore
    if (await fs.pathExists(gitIgnorePath)) {
        const content = await fs.readFile(gitIgnorePath, 'utf8');
        if (envExists && !content.includes('.env')) missingEntries.push('.env');
        if (nodeModulesExists && !content.includes('node_modules')) missingEntries.push('node_modules');
    } else {
        if (envExists) missingEntries.push('.env');
        if (nodeModulesExists) missingEntries.push('node_modules');
    }

    if (missingEntries.length > 0) {
        console.log(chalk.yellow(`  Security Alert: The following are not ignored: ${missingEntries.join(', ')}`));
        
        const { fixIgnore } = await inquirer.prompt([{
            type: 'confirm',
            name: 'fixIgnore',
            message: `Should I add ${missingEntries.join(' and ')} to .gitignore?`,
            default: true
        }]);

        if (fixIgnore) {
            const entryString = `\n# Added by GitReady AI\n${missingEntries.join('\n')}\n`;
            if (await fs.pathExists(gitIgnorePath)) {
                await fs.appendFile(gitIgnorePath, entryString);
            } else {
                await fs.writeFile(gitIgnorePath, entryString);
            }
            console.log(chalk.green(' .gitignore updated successfully.'));
        }
    }
}