import chalk from 'chalk';
import { calculateLevel, getTier } from '../gamification/level.js';

export async function leaderboardCommand(options?: { limit?: string }) {
  const limit = parseInt(options?.limit || '10');

  console.log(chalk.cyan('\n🏆 Global Leaderboard'));
  console.log(chalk.gray('─'.repeat(45)));
  console.log(chalk.yellow('  Top developers worldwide'));
  console.log();

  const topUsers = [
    { user: 'torvalds', contributions: 50000 },
    { user: 'github', contributions: 45000 },
    { user: 'facebook', contributions: 35000 },
    { user: 'microsoft', contributions: 30000 },
    { user: 'google', contributions: 28000 },
    { user: 'vercel', contributions: 15000 },
    { user: 'shadcn', contributions: 12000 },
    { user: 'tailwindcss', contributions: 10000 },
    { user: 'oven-sh', contributions: 8000 },
    { user: 'astro-build', contributions: 6000 }
  ].slice(0, limit);

  for (let i = 0; i < topUsers.length; i++) {
    const { user, contributions } = topUsers[i];
    const level = calculateLevel(contributions * 10);
    const tier = getTier(level);

    const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${(i + 1).toString().padStart(2)}.`;
    const name = user.length > 15 ? user.substring(0, 15) + '...' : user;

    console.log(`  ${rank} ${chalk.bold(name)} ${chalk.yellow('⭐')} [L${level} ${tier.emoji}]`);
  }

  console.log();
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.cyan('  Want to compete? Run ') + chalk.white('odyssey sync') + chalk.cyan(' to sync your data'));
}
