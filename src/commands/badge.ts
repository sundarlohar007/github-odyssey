import chalk from 'chalk';
import { achievements, getAchievement, generateBadgeSvg } from '../badges/achievements.js';
import fs from 'fs';

export async function badgeCommand(achievementId?: string, options?: { output?: string }) {
  if (!achievementId) {
    console.log(chalk.cyan('\n🏆 Available Badges'));
    console.log(chalk.gray('─'.repeat(30)));

    for (const a of achievements) {
      const rarityColor = a.rarity === 'legendary' ? chalk.yellow :
                         a.rarity === 'epic' ? chalk.magenta :
                         a.rarity === 'rare' ? chalk.blue : chalk.gray;
      console.log(`  ${a.name.padEnd(20)} ${a.icon} ${rarityColor('[' + a.rarity + ']')}`);
    }

    console.log();
    console.log(chalk.cyan('  Usage: ') + chalk.white('odyssey badge <achievement-id>'));
    return;
  }

  const achievement = getAchievement(achievementId);

  if (!achievement) {
    console.log(chalk.red(`\n  Error: Achievement not found: ${achievementId}`));
    return;
  }

  const svg = generateBadgeSvg(achievement, true);
  const filename = options?.output || `${achievement.id}.svg`;

  fs.writeFileSync(filename, svg);

  console.log(chalk.green(`\n  ✓ Badge saved to ${filename}`));
  console.log();
  console.log(chalk.yellow('  Badge: ') + achievement.name);
  console.log(chalk.gray('  Rarity: ') + achievement.rarity);
  console.log(chalk.gray('  Description: ') + achievement.description);
  console.log();
  console.log(chalk.gray('  Add to your README:'));
  console.log(chalk.gray('  ![') + achievement.name + chalk.gray('](badge-url)'));
}
