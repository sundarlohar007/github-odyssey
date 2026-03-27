import chalk from 'chalk';
import { GitHubClient } from '../api/github.js';
import { achievements, Rarity, getEarnedAchievements, Achievement } from '../badges/achievements.js';
import { loadToken } from '../utils/storage.js';

export async function achievementsCommand(username?: string, options?: { rarity?: string; locked?: boolean }) {
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

  let filteredAchievements = [...achievements];

  if (options?.rarity) {
    const rarity = options.rarity.toLowerCase() as Rarity;
    if (Object.values(Rarity).includes(rarity)) {
      filteredAchievements = filteredAchievements.filter(a => a.rarity === rarity);
    }
  }

  try {
    const userData = await client.getUserData(targetUsername);
    const userStats = {
      totalContributions: userData.totalContributions,
      currentStreak: userData.currentStreak,
      longestStreak: userData.longestStreak,
      publicRepos: userData.user.public_repos,
      followers: userData.user.followers
    };

    const earnedIds = new Set(getEarnedAchievements(userStats).map(a => a.id));
    const earned = filteredAchievements.filter(a => earnedIds.has(a.id));
    const locked = filteredAchievements.filter(a => !earnedIds.has(a.id));

    console.log(chalk.cyan('\n🏆 GitHub Odyssey - Achievements'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.yellow(`  Profile: @${targetUsername}`));
    console.log(chalk.yellow(`  Progress: ${earned.length}/${achievements.length}`));

    if (earned.length > 0) {
      console.log(chalk.green('\n✓ Earned'));
      for (const a of earned) {
        const rarityColor = a.rarity === Rarity.Legendary ? chalk.yellow :
                           a.rarity === Rarity.Epic ? chalk.magenta :
                           a.rarity === Rarity.Rare ? chalk.blue : chalk.gray;
        console.log(`  ${a.icon} ${chalk.bold(a.name)} ${rarityColor('[' + a.rarity + ']')} ${chalk.green('+' + a.xpBonus + ' XP')}`);
        console.log(chalk.gray(`      ${a.description}`));
      }
    }

    if (options?.locked && locked.length > 0) {
      console.log(chalk.gray('\n🔒 Locked'));
      for (const a of locked.slice(0, 20)) {
        console.log(`  🔒 ${a.name} [${a.rarity}]`);
      }
      if (locked.length > 20) {
        console.log(`  ... and ${locked.length - 20} more`);
      }
    }

    const totalXp = earned.reduce((sum, a) => sum + a.xpBonus, 0);
    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.green(`  +${totalXp} bonus XP from achievements!`));
  } catch (e: any) {
    console.log(chalk.red(`\nError: ${e.message}`));
  }
}
