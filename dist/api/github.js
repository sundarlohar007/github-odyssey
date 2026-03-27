import axios from 'axios';
import chalk from 'chalk';
export class GitHubClient {
    token = null;
    constructor(token) {
        // Only use token if it's not empty and not a test token
        if (token && token.length > 10 && token !== 'test') {
            this.token = token;
        }
    }
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Odyssey/1.0'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async getUser(username) {
        try {
            const response = await axios.get(`https://api.github.com/users/${username}`, {
                headers: this.getHeaders(),
                timeout: 10000
            });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 403) {
                const remaining = error.response.headers['x-ratelimit-remaining'];
                if (remaining === '0') {
                    const resetTime = new Date(error.response.headers['x-ratelimit-reset'] * 1000);
                    throw new Error(`GitHub API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}. Run "odyssey setup" with a GitHub token to increase limits.`);
                }
                throw new Error('GitHub API rate limit exceeded. Please try again later or use a GitHub token.');
            }
            if (error.response?.status === 401) {
                throw new Error('Invalid GitHub token. Run "odyssey setup" to configure a new token.');
            }
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please check your internet connection.');
            }
            throw error;
        }
    }
    async getAuthenticatedUser() {
        const response = await axios.get('https://api.github.com/user', {
            headers: this.getHeaders()
        });
        return response.data;
    }
    async getUserContributions(username) {
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
        try {
            const response = await axios.post('https://api.github.com/graphql', {
                query,
                variables: { username }
            }, {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            if (response.data.errors) {
                console.log(chalk.yellow('Warning: GraphQL errors, using fallback data'));
                return { totalContributions: 0, weeks: [] };
            }
            return response.data.data?.user?.contributionsCollection?.contributionCalendar;
        }
        catch (error) {
            console.log(chalk.yellow('Warning: Could not fetch contributions, using estimate'));
            return { totalContributions: 0, weeks: [] };
        }
    }
    async getUserLanguages(username) {
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
        try {
            const response = await axios.post('https://api.github.com/graphql', {
                query,
                variables: { username }
            }, {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            const repos = response.data.data?.user?.repositories?.nodes || [];
            const languageSizes = new Map();
            for (const repo of repos) {
                const langs = repo?.languages?.edges || [];
                for (const lang of langs) {
                    const existing = languageSizes.get(lang.node.name);
                    if (existing) {
                        existing.size += lang.size;
                    }
                    else {
                        languageSizes.set(lang.node.name, { size: lang.size, color: lang.node.color });
                    }
                }
            }
            return Array.from(languageSizes.entries())
                .map(([name, { size, color }]) => ({ name, color, size }))
                .sort((a, b) => b.size - a.size)
                .slice(0, 10);
        }
        catch (error) {
            console.log(chalk.yellow('Warning: Could not fetch languages'));
            return [];
        }
    }
    async getUserData(username) {
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
                }
                else {
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
//# sourceMappingURL=github.js.map