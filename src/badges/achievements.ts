export enum Rarity {
  Common = 'common',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  condition: (stats: UserStats) => boolean;
  xpBonus: number;
}

export interface UserStats {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  publicRepos: number;
  followers: number;
}

export const achievements: Achievement[] = [
  {
    id: 'first_commit',
    name: 'First Blood',
    description: 'Made your first commit',
    icon: '🎯',
    rarity: Rarity.Common,
    condition: (s) => s.totalContributions >= 1,
    xpBonus: 10
  },
  {
    id: 'hello_world',
    name: 'Hello World',
    description: 'Created your first repository',
    icon: '👋',
    rarity: Rarity.Common,
    condition: (s) => s.publicRepos >= 1,
    xpBonus: 25
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Closed your first issue',
    icon: '🐛',
    rarity: Rarity.Common,
    condition: (s) => s.totalContributions >= 5,
    xpBonus: 15
  },
  {
    id: 'reviewer',
    name: 'Code Reviewer',
    description: 'Submitted your first review',
    icon: '👀',
    rarity: Rarity.Common,
    condition: (s) => s.totalContributions >= 10,
    xpBonus: 15
  },
  {
    id: 'commit_10',
    name: 'Getting Started',
    description: '10 commits made',
    icon: '📊',
    rarity: Rarity.Common,
    condition: (s) => s.totalContributions >= 10,
    xpBonus: 50
  },
  {
    id: 'commit_50',
    name: 'Code Machine',
    description: '50 commits made',
    icon: '⚡',
    rarity: Rarity.Rare,
    condition: (s) => s.totalContributions >= 50,
    xpBonus: 100
  },
  {
    id: 'commit_100',
    name: 'Century Club',
    description: '100 commits made',
    icon: '💯',
    rarity: Rarity.Rare,
    condition: (s) => s.totalContributions >= 100,
    xpBonus: 200
  },
  {
    id: 'commit_500',
    name: 'Commit Master',
    description: '500 commits made',
    icon: '🏃',
    rarity: Rarity.Epic,
    condition: (s) => s.totalContributions >= 500,
    xpBonus: 500
  },
  {
    id: 'commit_1000',
    name: 'Legendary Coder',
    description: '1000 commits made',
    icon: '👑',
    rarity: Rarity.Legendary,
    condition: (s) => s.totalContributions >= 1000,
    xpBonus: 1000
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7 day coding streak',
    icon: '🔥',
    rarity: Rarity.Rare,
    condition: (s) => s.currentStreak >= 7,
    xpBonus: 100
  },
  {
    id: 'streak_30',
    name: 'Monthly Maven',
    description: '30 day coding streak',
    icon: '💪',
    rarity: Rarity.Epic,
    condition: (s) => s.currentStreak >= 30,
    xpBonus: 300
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: '100 day coding streak',
    icon: '🏅',
    rarity: Rarity.Legendary,
    condition: (s) => s.currentStreak >= 100,
    xpBonus: 1000
  },
  {
    id: 'follower_10',
    name: 'Rising Star',
    description: '10 followers',
    icon: '🌟',
    rarity: Rarity.Rare,
    condition: (s) => s.followers >= 10,
    xpBonus: 50
  },
  {
    id: 'follower_100',
    name: 'Influencer',
    description: '100 followers',
    icon: '⭐',
    rarity: Rarity.Epic,
    condition: (s) => s.followers >= 100,
    xpBonus: 300
  }
];

export function getEarnedAchievements(stats: UserStats): Achievement[] {
  return achievements.filter(a => a.condition(stats));
}

export function getAchievement(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}

export function generateBadgeSvg(achievement: Achievement, earned: boolean): string {
  const colors: Record<Rarity, { bg: string; border: string }> = {
    [Rarity.Common]: { bg: '#21262d', border: '#8b949e' },
    [Rarity.Rare]: { bg: '#161b22', border: '#58a6ff' },
    [Rarity.Epic]: { bg: '#0d1117', border: '#a371f7' },
    [Rarity.Legendary]: { bg: '#0d1117', border: '#f0b429' }
  };

  const { bg, border } = colors[achievement.rarity];
  const icon = earned ? achievement.icon : '🔒';
  const opacity = earned ? '1' : '0.4';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
  <rect x="2" y="2" width="196" height="76" rx="10" fill="${bg}" stroke="${border}" stroke-width="2"/>
  <text x="20" y="38" font-size="28" opacity="${opacity}">${icon}</text>
  <text x="55" y="28" font-family="monospace" font-size="11" fill="#f0f6fc" font-weight="bold" opacity="${opacity}">
    ${achievement.name}
  </text>
  <text x="55" y="46" font-family="sans-serif" font-size="9" fill="#8b949e" opacity="${opacity}">
    ${achievement.description}
  </text>
  <text x="185" y="72" font-family="monospace" font-size="8" fill="${border}" opacity="${opacity}">
    ${achievement.rarity.toUpperCase()}
  </text>
</svg>`;
}
