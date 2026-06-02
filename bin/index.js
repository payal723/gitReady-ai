#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
const program = new Command();

program
  .name('gitready')
  .description('AI-powered developer workflow automator')
  .version('1.1.0');

program
  .command('commit')
  .description('Analyze changes and generate AI commit & README update')
  .action(async () => {
    const { runCommitFlow } = await import('../src/commands/commit.js');
    await runCommitFlow();
  });

program
  .command('audit')
  .description('Deep scan the repository for leaked secrets (AWS, JWT, Keys)')
  .action(async () => {
    const { runAuditFlow } = await import('../src/commands/audit.js');
    await runAuditFlow();
  });

program.parse();