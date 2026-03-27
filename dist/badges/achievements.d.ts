export declare enum Rarity {
    Common = "common",
    Rare = "rare",
    Epic = "epic",
    Legendary = "legendary"
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
export declare const achievements: Achievement[];
export declare function getEarnedAchievements(stats: UserStats): Achievement[];
export declare function getAchievement(id: string): Achievement | undefined;
export declare function generateBadgeSvg(achievement: Achievement, earned: boolean): string;
//# sourceMappingURL=achievements.d.ts.map