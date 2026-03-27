import chalk from 'chalk';
import { GitHubClient } from '../api/github.js';
import { calculateLevel, getTier } from '../gamification/level.js';
import { loadToken } from '../utils/storage.js';

export async function battleCommand(yourUsername?: string, opponent?: string) {
  if (!opponent) {
    console.log(chalk.red('Error: Please specify an opponent. Usage: odyssey battle <opponent>'));
    return;
  }

  const token = loadToken() || undefined;
  const client = new GitHubClient(token);

  let you = yourUsername;

  if (!you) {
    try {
      const user = await client.getAuthenticatedUser();
      you = user.login;
    } catch (e) {
      console.log(chalk.red('Error: Not authenticated. Run `odyssey setup` first.'));
      return;
    }
  }

  console.log(chalk.red('\n⚔️  BATTLE!'));
  console.log();
  console.log(`  ${chalk.blue.bold(you)}  ${chalk.gray('VS')}  ${chalk.red.bold(opponent)}`);
  console.log(chalk.cyan('═'.repeat(40)));
  console.log();

  try {
    const [youData, oppData] = await Promise.all([
      client.getUserData(you),
      client.getUserData(opponent)
    ]);

    const youXp = youData.totalContributions * 10 + youData.currentStreak * 50;
    const oppXp = oppData.totalContributions * 10 + oppData.currentStreak * 50;

    const youLevel = calculateLevel(youData.totalContributions * 10);
    const oppLevel = calculateLevel(oppData.totalContributions * 10);

    const youTier = getTier(youLevel);
    const oppTier = getTier(oppLevel);

    console.log(chalk.gray('  Stat').padEnd(25) + you!.padEnd(12) + '|  ' + opponent);
    console.log(chalk.gray('  ' + '-'.repeat(50)));

    const stats = [
      ['Contributions', youData.totalContributions, oppData.totalContributions],
      ['Repos', youData.user.public_repos, oppData.user.public_repos],
      ['Followers', youData.user.followers, oppData.user.followers],
      ['Streak', youData.currentStreak, oppData.currentStreak]
    ];

    for (const [label, youVal, oppVal] of stats) {
      const youStr = youVal.toString().padStart(10);
      const oppStr = oppVal.toString();
      const winner = youVal > oppVal ? '◄ ' : oppVal > youVal ? ' ►' : '  ';

      console.log(`  ${(label as string).padEnd(20)} ${chalk.blue(youStr)}  ${winner}  ${chalk.red(oppStr)}`);
    }

    console.log();
    console.log(chalk.cyan('═'.repeat(40)));
    console.log(`  ${you} ${chalk.cyan('L' + youLevel.toString())} ${youTier.emoji} vs ${chalk.red('L' + oppLevel.toString())} ${oppTier.emoji} ${opponent}`);
    console.log();

    if (youXp > oppXp) {
      console.log(`  ${chalk.green.bold('►')} ${chalk.green.bold(you)} WINS!`);
    } else if (oppXp > youXp) {
      console.log(`  ${chalk.green.bold('►')} ${chalk.red.bold(opponent)} WINS!`);
    } else {
      console.log(chalk.yellow.bold('  = IT\'S A TIE!'));
    }

    console.log();
  } catch (e: any) {
    console.log(chalk.red(`\nError: ${e.message}`));
  }
}
