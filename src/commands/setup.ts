import chalk from 'chalk';
import { saveToken, loadToken } from '../utils/storage.js';
import readline from 'readline';

export async function setupCommand(options?: { token?: string }) {
  console.log(chalk.cyan('\n⚙️  GitHub Odyssey Setup'));
  console.log();

  if (options?.token) {
    await saveToken(options.token);
    console.log(chalk.green('  ✓ Token saved successfully!'));
    console.log();
    console.log(chalk.cyan('  Run ') + chalk.white('odyssey profile') + chalk.cyan(' to get started'));
    return;
  }

  const existingToken = loadToken();
  if (existingToken) {
    console.log(chalk.blue('  ℹ  You already have a token configured'));
    console.log(chalk.gray(`     Token: ${existingToken.substring(0, 8)}...`));
    console.log();
  }

  console.log('  To get a GitHub Personal Access Token:');
  console.log('  1. Go to ' + chalk.cyan('https://github.com/settings/tokens'));
  console.log('  2. Click ' + chalk.yellow('\'Generate new token (classic)\''));
  console.log('  3. Give it a name (e.g., ' + chalk.yellow('\'odyssey\'') + ')');
  console.log('  4. Select scope: ' + chalk.yellow('read:user') + ' (needed for full features)');
  console.log('  5. Click ' + chalk.yellow('\'Generate token\''));
  console.log();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('  Enter your GitHub Personal Access Token: ', async (token) => {
    rl.close();
    if (!token.trim()) {
      console.log(chalk.red('  Error: Token cannot be empty'));
      return;
    }

    await saveToken(token.trim());

    console.log();
    console.log(chalk.green.bold('  ✓ Token saved successfully!'));
    console.log();
    console.log('  Next steps:');
    console.log('    1. Run ' + chalk.cyan('odyssey sync') + ' to sync your data');
    console.log('    2. Run ' + chalk.cyan('odyssey profile') + ' to view your profile');
    console.log('    3. Run ' + chalk.cyan('odyssey badge') + ' to generate badges');
  });
}
