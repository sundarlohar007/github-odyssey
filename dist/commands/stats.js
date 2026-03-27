import chalk from 'chalk';
import { GitHubClient } from '../api/github.js';
import { calculateLevel, getTier } from '../gamification/level.js';
import { loadToken } from '../utils/storage.js';
export async function statsCommand(username) {
    const token = loadToken() || undefined;
    const client = new GitHubClient(token);
    let targetUsername = username;
    if (!targetUsername) {
        try {
            const user = await client.getAuthenticatedUser();
            targetUsername = user.login;
        }
        catch (e) {
            console.log(chalk.red('Error: Not authenticated. Run `odyssey setup` first.'));
            return;
        }
    }
    console.log(chalk.cyan('\n📊 GitHub Odyssey - Statistics'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.yellow(`  User: @${targetUsername}`));
    try {
        const userData = await client.getUserData(targetUsername);
        const xp = userData.totalContributions * 10;
        const level = calculateLevel(xp);
        const tier = getTier(level);
        console.log(chalk.yellow('\n📈 Overview'));
        const overview = [
            ['Total Contributions', userData.totalContributions],
            ['Public Repositories', userData.user.public_repos],
            ['Followers', userData.user.followers],
            ['Following', userData.user.following]
        ];
        for (const [label, value] of overview) {
            console.log(`  ${chalk.gray(label + ':').padEnd(25)} ${chalk.green(value)}`);
        }
        console.log(chalk.yellow('\n⚔️  Power Level'));
        console.log(`  Level: ${tier.emoji} ${chalk.bold(level.toString())} ${tier.tier}`);
        console.log(`  Rank: ${chalk.cyan(tier.tier)}`);
        console.log(chalk.yellow('\n🔥 Streak Stats'));
        console.log(`  Current: ${chalk.green(userData.currentStreak.toString())} days`);
        console.log(`  Longest: ${chalk.yellow(userData.longestStreak.toString())} days`);
        console.log(chalk.yellow('\n🗣️  Languages'));
        for (const lang of userData.languages.slice(0, 8)) {
            const sizeMb = (lang.size / 1000000).toFixed(1);
            console.log(`  ${lang.name.padEnd(20)} ${chalk.gray(sizeMb + ' MB')}`);
        }
        console.log(chalk.gray('\n' + '─'.repeat(50)));
    }
    catch (e) {
        console.log(chalk.red(`\nError: ${e.message}`));
    }
}
//# sourceMappingURL=stats.js.map