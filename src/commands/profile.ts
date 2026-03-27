import chalk from 'chalk';
import { GitHubClient } from '../api/github.js';
import { calculateLevel, getTier, progressToNextLevel, xpForLevel } from '../gamification/level.js';
import { getEarnedAchievements } from '../badges/achievements.js';
import { loadToken } from '../utils/storage.js';

export async function profileCommand(username?: string) {
  const token = loadToken() || undefined;
  const client = new GitHubClient(token);

  let targetUsername = username;

  if (!targetUsername) {
    try {
      const user = await client.getAuthenticatedUser();
      targetUsername = user.login;
    } catch (e) {
      console.log(chalk.red('Error: Not authenticated. Run `odyssey setup` first.'));
      return;
    }
  }

  console.log(chalk.cyan('\n⛰️  GitHub Odyssey'));
  console.log(chalk.gray('─'.repeat(50)));

  try {
    const userData = await client.getUserData(targetUsername);
    const xp = userData.totalContributions * 10;
    const level = calculateLevel(xp);
    const tier = getTier(level);
    const progress = progressToNextLevel(xp);
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = xpForLevel(level + 1);
    const xpInLevel = xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    console.log(chalk.bold(`\n  👤 ${userData.user.login}`));
    if (userData.user.name) {
      console.log(chalk.gray(`     ${userData.user.name}`));
    }

    console.log(chalk.yellow('\n  ⚔️  Level'));
    console.log(chalk.bold(`     ${tier.emoji} Level ${level} ${tier.tier}`));

    const barWidth = 20;
    const filled = Math.floor((progress / 100) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    console.log(`     [${chalk.green(bar.substring(0, filled))}${chalk.gray(bar.substring(filled))}] ${progress}%`);
    console.log(chalk.cyan(`     ${xpInLevel} / ${xpNeeded} XP to next level`));

    const stats = [
      ['Total Contributions', userData.totalContributions.toString()],
      ['Current Streak', `${userData.currentStreak} days 🔥`],
      ['Longest Streak', `${userData.longestStreak} days`],
      ['Public Repos', userData.user.public_repos.toString()],
      ['Followers', userData.user.followers.toString()]
    ];

    console.log(chalk.yellow('\n  📊 Stats'));
    for (const [label, value] of stats) {
      console.log(`     ${chalk.gray(label + ':')} ${chalk.green(value)}`);
    }

    console.log(chalk.yellow('\n  🗣️  Top Languages'));
    for (const lang of userData.languages.slice(0, 5)) {
      const sizeMb = (lang.size / 1000000).toFixed(1);
      console.log(`     ● ${lang.name} ${chalk.gray(sizeMb + ' MB')}`);
    }

    const userStats = {
      totalContributions: userData.totalContributions,
      currentStreak: userData.currentStreak,
      longestStreak: userData.longestStreak,
      publicRepos: userData.user.public_repos,
      followers: userData.user.followers
    };

    const earned = getEarnedAchievements(userStats);
    console.log(chalk.yellow('\n  🏆 Achievements'));
    console.log(`     ${earned.length} badges earned!`);

    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.cyan('  Run ') + chalk.white('odyssey achievements') + chalk.cyan(' to see all badges'));
    console.log(chalk.cyan('  Run ') + chalk.white('odyssey card') + chalk.cyan(' to generate your player card'));
  } catch (e: any) {
    console.log(chalk.red(`\nError: ${e.message}`));
    if (e.response?.status === 404) {
      console.log(chalk.gray('User not found. Check the username and try again.'));
    }
  }
}
