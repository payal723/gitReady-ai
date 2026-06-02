import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { deepScan } from '../security/scanner.js';

export async function runAuditFlow() {
    console.log(chalk.blue.bold('\n Running GitReady Repository Audit...'));
    
    let score = 100;
    const issues = [];
    const currentDir = process.cwd();

    const findings = await deepScan(currentDir);
    if (findings.length > 0) {
        score -= (findings.length * 15);
        issues.push(chalk.red(`- Found ${findings.length} leaked secrets/keys!`));
    }

    if (!(await fs.pathExists(path.join(currentDir, 'README.md')))) {
        score -= 30;
        issues.push(chalk.yellow("- README.md is missing."));
    }

    if (!(await fs.pathExists(path.join(currentDir, '.gitignore')))) {
        score -= 20;
        issues.push(chalk.yellow("- .gitignore is missing."));
    }

    if (await fs.pathExists(path.join(currentDir, 'node_modules'))) {
        score += 5; 
    }

    console.log(chalk.bold('\n--- Audit Report ---'));
    
    let scoreColor = score > 80 ? chalk.green : score > 50 ? chalk.yellow : chalk.red;
    console.log(`Repo Health Score: ${scoreColor(score + '/100')}`);

    if (issues.length > 0) {
        console.log(chalk.bold('\nSuggestions to improve:'));
        issues.forEach(issue => console.log(issue));
    } else {
        console.log(chalk.green('\n Your repository structure is excellent!'));
    }
}