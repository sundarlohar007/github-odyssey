import axios from 'axios';

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

export class GitHubClient {
  private token: string | null = null;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || null;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Odyssey/1.0'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getUser(username: string): Promise<User> {
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getAuthenticatedUser(): Promise<User> {
    const response = await axios.get('https://api.github.com/user', {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getUserContributions(username: string): Promise<any> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: { username }
      },
      {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data?.user?.contributionsCollection?.contributionCalendar;
  }

  async getUserLanguages(username: string): Promise<Language[]> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          repositories(first: 100, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], orderBy: {field: STARGAZERS, direction: DESC}) {
            nodes {
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: { username }
      },
      {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );

    const repos = response.data.data?.user?.repositories?.nodes || [];
    const languageSizes: Map<string, { size: number; color: string | null }> = new Map();

    for (const repo of repos) {
      const langs = repo?.languages?.edges || [];
      for (const lang of langs) {
        const existing = languageSizes.get(lang.node.name);
        if (existing) {
          existing.size += lang.size;
        } else {
          languageSizes.set(lang.node.name, { size: lang.size, color: lang.node.color });
        }
      }
    }

    return Array.from(languageSizes.entries())
      .map(([name, { size, color }]) => ({ name, color, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
  }

  async getUserData(username: string): Promise<UserData> {
    const [user, calendar, languages] = await Promise.all([
      this.getUser(username),
      this.getUserContributions(username),
      this.getUserLanguages(username)
    ]);

    const totalContributions = calendar?.totalContributions || 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const weeks = calendar?.weeks || [];
    for (let i = weeks.length - 1; i >= 0; i--) {
      const days = weeks[i]?.contributionDays || [];
      for (let j = days.length - 1; j >= 0; j--) {
        const day = days[j];
        if (day.contributionCount > 0) {
          tempStreak++;
        } else {
          if (currentStreak === 0 && tempStreak > 0) {
            currentStreak = tempStreak;
          }
          tempStreak = 0;
        }
      }
    }

    if (currentStreak === 0) {
      currentStreak = tempStreak;
    }
    longestStreak = Math.max(currentStreak, tempStreak);

    return {
      user,
      totalContributions,
      languages,
      currentStreak,
      longestStreak
    };
  }
}
