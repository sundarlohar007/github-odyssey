#!/usr/bin/env node
import { Command } from 'commander';
import { profileCommand } from './commands/profile.js';
import { statsCommand } from './commands/stats.js';
import { achievementsCommand } from './commands/achievements.js';
import { leaderboardCommand } from './commands/leaderboard.js';
import { battleCommand } from './commands/battle.js';
import { syncCommand } from './commands/sync.js';
import { badgeCommand } from './commands/badge.js';
import { cardCommand } from './commands/card.js';
import { setupCommand } from './commands/setup.js';
const program = new Command();
program
    .name('odyssey')
    .description('🏆 Level Up Your GitHub Journey')
    .version('1.0.0');
program
    .command('profile')
    .description('View your odyssey profile')
    .argument('[username]', 'GitHub username')
    .action(profileCommand);
program
    .command('stats')
    .description('View your stats and statistics')
    .argument('[username]', 'GitHub username')
    .option('-p, --period <period>', 'Time period: week, month, year, all')
    .action(statsCommand);
program
    .command('achievements')
    .description('View your achievements')
    .argument('[username]', 'GitHub username')
    .option('-r, --rarity <rarity>', 'Filter by rarity: common, rare, epic, legendary')
    .option('-l, --locked', 'Show locked achievements')
    .action(achievementsCommand);
program
    .command('leaderboard')
    .description('View the global leaderboard')
    .option('-l, --limit <limit>', 'Limit results')
    .action(leaderboardCommand);
program
    .command('battle')
    .description('Battle: compare with another developer')
    .argument('[your_username]', 'Your username')
    .argument('opponent', 'Opponent username')
    .action(battleCommand);
program
    .command('sync')
    .description('Sync your data from GitHub')
    .argument('[username]', 'GitHub username')
    .action(syncCommand);
program
    .command('badge')
    .description('Generate a badge for your profile')
    .argument('[achievement]', 'Achievement ID')
    .option('-o, --output <output>', 'Output file path')
    .action(badgeCommand);
program
    .command('card')
    .description('Generate your player card')
    .argument('[username]', 'GitHub username')
    .option('-o, --output <output>', 'Output file path')
    .action(cardCommand);
program
    .command('setup')
    .description('Setup odyssey with GitHub')
    .option('-t, --token <token>', 'GitHub Personal Access Token')
    .action(setupCommand);
program.parse();
//# sourceMappingURL=index.js.map