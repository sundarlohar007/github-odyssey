export enum LevelTier {
  Noob = 'Noob',
  Novice = 'Novice',
  Apprentice = 'Apprentice',
  Journeyman = 'Journeyman',
  Expert = 'Expert',
  Master = 'Master',
  Grandmaster = 'Grandmaster',
  Legend = 'Legend',
  Mythic = 'Mythic',
  Divine = 'Divine'
}

export function getTier(level: number): { tier: LevelTier; emoji: string; color: string } {
  if (level <= 5) return { tier: LevelTier.Noob, emoji: '🌱', color: '#8b949e' };
  if (level <= 10) return { tier: LevelTier.Novice, emoji: '⭐', color: '#3fb950' };
  if (level <= 20) return { tier: LevelTier.Apprentice, emoji: '⚔️', color: '#58a6ff' };
  if (level <= 35) return { tier: LevelTier.Journeyman, emoji: '🛡️', color: '#a371f7' };
  if (level <= 50) return { tier: LevelTier.Expert, emoji: '💎', color: '#f0b429' };
  if (level <= 70) return { tier: LevelTier.Master, emoji: '👑', color: '#f85149' };
  if (level <= 85) return { tier: LevelTier.Grandmaster, emoji: '🔥', color: '#ff7b72' };
  if (level <= 95) return { tier: LevelTier.Legend, emoji: '⚡', color: '#ffa657' };
  if (level <= 99) return { tier: LevelTier.Mythic, emoji: '🌟', color: '#d2a8ff' };
  return { tier: LevelTier.Divine, emoji: '🏆', color: '#ffd700' };
}

export function calculateLevel(xp: number): number {
  if (xp === 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return level * level * 100;
}

export function progressToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);

  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  if (xpNeeded === 0) return 100;

  return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));
}

export function rankTitle(level: number): string {
  const { tier, emoji } = getTier(level);
  return `${emoji} ${tier}`;
}
