import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getConfigDir(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || process.env.APPDATA || '.';
  return path.join(homeDir, '.odyssey');
}

function ensureConfigDir(): void {
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

export function getTokenPath(): string {
  return path.join(getConfigDir(), 'token');
}

export function getDataPath(): string {
  return path.join(getConfigDir(), 'data.json');
}

export async function saveToken(token: string): Promise<void> {
  ensureConfigDir();
  fs.writeFileSync(getTokenPath(), token, 'utf-8');
}

export function loadToken(): string | null {
  const tokenPath = getTokenPath();
  if (!fs.existsSync(tokenPath)) {
    return null;
  }
  return fs.readFileSync(tokenPath, 'utf-8').trim();
}

export interface StoredData {
  username: string;
  totalContributions: number;
  currentStreak: number;
  lastSync: string;
}

export async function saveData(data: StoredData): Promise<void> {
  ensureConfigDir();
  fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2), 'utf-8');
}

export function loadData(): StoredData | null {
  const dataPath = getDataPath();
  if (!fs.existsSync(dataPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  const tokenPath = getTokenPath();
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
  }
}
