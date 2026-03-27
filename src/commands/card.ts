import chalk from 'chalk';
import { GitHubClient } from '../api/github.js';
import { calculateLevel, getTier, progressToNextLevel, xpForLevel } from '../gamification/level.js';
import { getEarnedAchievements } from '../badges/achievements.js';
import { loadToken } from '../utils/storage.js';
import fs from 'fs';

export async function cardCommand(username?: string, options?: { output?: string }) {
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

  console.log(chalk.cyan('\n🎴 Generating player card...'));

  try {
    const userData = await client.getUserData(targetUsername);
    const xp = userData.totalContributions * 10;
    const level = calculateLevel(xp);
    const tier = getTier(level);
    const progress = progressToNextLevel(xp);
    const nextLevelXp = xpForLevel(level + 1);
    const currentLevelXp = xpForLevel(level);

    const userStats = {
      totalContributions: userData.totalContributions,
      currentStreak: userData.currentStreak,
      longestStreak: userData.longestStreak,
      publicRepos: userData.user.public_repos,
      followers: userData.user.followers
    };

    const earned = getEarnedAchievements(userStats).slice(0, 5);

    const svg = generatePlayerCard(
      userData.user.login,
      userData.user.avatar_url,
      level,
      xp,
      nextLevelXp - currentLevelXp,
      userData.currentStreak,
      tier,
      earned.map(e => e.icon)
    );

    const filename = options?.output || `${targetUsername}-card.svg`;
    fs.writeFileSync(filename, svg);

    console.log();
    console.log(chalk.green(`  ✓ Player card saved to ${filename}`));
    console.log();
    console.log(chalk.yellow('  Level: ') + `${tier.emoji} ${level}`);
    console.log(chalk.yellow('  Title: ') + tier.tier);
    console.log(chalk.yellow('  Streak: ') + `${userData.currentStreak} days`);
    console.log(chalk.yellow('  XP: ') + xp);
    console.log();
    console.log(chalk.gray('  Add to your README:'));
    console.log(chalk.gray('  ![') + 'Card' + chalk.gray('](card-url)'));
  } catch (e: any) {
    console.log(chalk.red(`\nError: ${e.message}`));
  }
}

function generatePlayerCard(
  username: string,
  avatarUrl: string,
  level: number,
  xp: number,
  xpToNext: number,
  streak: number,
  tier: { tier: string; emoji: string; color: string },
  badges: string[]
): string {
  const progress = Math.floor((xp / (xp + xpToNext)) * 100);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#161b22"/>
      <stop offset="50%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#161b22"/>
    </linearGradient>
    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#58a6ff"/>
      <stop offset="100%" style="stop-color:#a371f7"/>
    </linearGradient>
  </defs>

  <rect width="400" height="200" rx="16" fill="url(#cardGrad)" stroke="#30363d" stroke-width="2"/>

  <circle cx="50" cy="100" r="37" fill="none" stroke="#58a6ff" stroke-width="3"/>
  <image href="${avatarUrl}" x="15" y="65" width="70" height="70"/>

  <text x="100" y="60" font-family="monospace" font-size="24" fill="#f0f6fc" font-weight="bold">
    ${username}
  </text>

  <text x="100" y="82" font-family="sans-serif" font-size="12" fill="#8b949e">
    ${tier.emoji} Level ${level} ${tier.tier}
  </text>

  <rect x="100" y="95" width="200" height="8" rx="4" fill="#21262d"/>
  <rect x="100" y="95" width="${progress * 2}" height="8" rx="4" fill="url(#progressGrad)"/>

  <text x="305" y="102" font-family="monospace" font-size="10" fill="#58a6ff">
    ${xp}/${xp + xpToNext} XP
  </text>

  <text x="100" y="125" font-family="monospace" font-size="14" fill="#3fb950">
    🔥 ${streak} day streak
  </text>

  <rect x="95" y="160" width="310" height="2" fill="#21262d"/>

  <text x="100" y="178" font-family="sans-serif" font-size="10" fill="#8b949e">
    🏆 Achievements
  </text>

  ${badges.map((icon, i) => `<text x="${130 + i * 18}" y="68" font-size="16">${icon}</text>`).join('\n  ')}
</svg>`;
}
