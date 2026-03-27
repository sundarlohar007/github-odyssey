import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function getConfigDir() {
    const homeDir = process.env.HOME || process.env.USERPROFILE || process.env.APPDATA || '.';
    return path.join(homeDir, '.odyssey');
}
function ensureConfigDir() {
    const configDir = getConfigDir();
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
}
export function getTokenPath() {
    return path.join(getConfigDir(), 'token');
}
export function getDataPath() {
    return path.join(getConfigDir(), 'data.json');
}
export async function saveToken(token) {
    ensureConfigDir();
    fs.writeFileSync(getTokenPath(), token, 'utf-8');
}
export function loadToken() {
    const tokenPath = getTokenPath();
    if (!fs.existsSync(tokenPath)) {
        return null;
    }
    return fs.readFileSync(tokenPath, 'utf-8').trim();
}
export async function saveData(data) {
    ensureConfigDir();
    fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2), 'utf-8');
}
export function loadData() {
    const dataPath = getDataPath();
    if (!fs.existsSync(dataPath)) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    catch {
        return null;
    }
}
export async function clearToken() {
    const tokenPath = getTokenPath();
    if (fs.existsSync(tokenPath)) {
        fs.unlinkSync(tokenPath);
    }
}
//# sourceMappingURL=storage.js.map