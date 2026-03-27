export interface User {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    bio: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}
export interface UserData {
    user: User;
    totalContributions: number;
    languages: Language[];
    currentStreak: number;
    longestStreak: number;
}
export interface Language {
    name: string;
    color: string | null;
    size: number;
}
export declare class GitHubClient {
    private token;
    constructor(token?: string);
    private getHeaders;
    getUser(username: string): Promise<User>;
    getAuthenticatedUser(): Promise<User>;
    getUserContributions(username: string): Promise<any>;
    getUserLanguages(username: string): Promise<Language[]>;
    getUserData(username: string): Promise<UserData>;
}
//# sourceMappingURL=github.d.ts.map