import chalk from 'chalk';
import { GitHubClient } from '../api/github.js';
import { saveData, loadToken } from '../utils/storage.js';

export async function syncCommand(username?: string) {
  const token = loadToken();

  if (!token) {
    console.log(chalk.red('Error: Not authenticated. Run `odyssey setup` first.'));
    return;
  }

  const client = new GitHubClient(token);

  let targetUsername = username;

  if (!targetUsername) {
    try {
      const user = await client.getAuthenticatedUser();
      targetUsername = user.login;
    } catch (e) {
      console.log(chalk.red('Error: Failed to get authenticated user.'));
      return;
    }
  }

  console.log(chalk.cyan('\n🔄 Syncing with GitHub...'));
  console.log();

  try {
    const userData = await client.getUserData(targetUsername);

    await saveData({
      username: targetUsername,
      totalContributions: userData.totalContributions,
      currentStreak: userData.currentStreak,
      lastSync: new Date().toISOString()
    });

    console.log(chalk.green(`  ✓ Synced: @${targetUsername}`));
    console.log(chalk.green(`  ✓ Contributions: ${userData.totalContributions}`));
    console.log(chalk.green(`  ✓ Streak: ${userData.currentStreak} days`));
    console.log();
    console.log(chalk.green.bold('  ✓ Sync complete!'));
    console.log(chalk.cyan('  Run ') + chalk.white('odyssey profile') + chalk.cyan(' to view your profile'));
  } catch (e: any) {
    console.log(chalk.red(`\nError: ${e.message}`));
  }
}
