export declare enum LevelTier {
    Noob = "Noob",
    Novice = "Novice",
    Apprentice = "Apprentice",
    Journeyman = "Journeyman",
    Expert = "Expert",
    Master = "Master",
    Grandmaster = "Grandmaster",
    Legend = "Legend",
    Mythic = "Mythic",
    Divine = "Divine"
}
export declare function getTier(level: number): {
    tier: LevelTier;
    emoji: string;
    color: string;
};
export declare function calculateLevel(xp: number): number;
export declare function xpForLevel(level: number): number;
export declare function progressToNextLevel(xp: number): number;
export declare function rankTitle(level: number): string;
//# sourceMappingURL=level.d.ts.map