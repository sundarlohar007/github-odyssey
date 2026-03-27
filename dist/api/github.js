import axios from 'axios';
export class GitHubClient {
    token = null;
    constructor(token) {
        this.token = token || process.env.GITHUB_TOKEN || null;
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
        const response = await axios.get(`https://api.github.com/users/${username}`, {
            headers: this.getHeaders()
        });
        return response.data;
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
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables: { username }
        }, {
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'application/json'
            }
        });
        return response.data.data?.user?.contributionsCollection?.contributionCalendar;
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
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables: { username }
        }, {
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'application/json'
            }
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