export declare function getTokenPath(): string;
export declare function getDataPath(): string;
export declare function saveToken(token: string): Promise<void>;
export declare function loadToken(): string | null;
export interface StoredData {
    username: string;
    totalContributions: number;
    currentStreak: number;
    lastSync: string;
}
export declare function saveData(data: StoredData): Promise<void>;
export declare function loadData(): StoredData | null;
export declare function clearToken(): Promise<void>;
//# sourceMappingURL=storage.d.ts.map