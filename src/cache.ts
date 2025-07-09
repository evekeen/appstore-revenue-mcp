import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CacheData, CacheEntry, SensorTowerApp } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'revenue-cache.json');
const CACHE_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export class Cache {
  private cacheData: CacheData = {};

  async init(): Promise<void> {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await this.load();
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }

  private async load(): Promise<void> {
    try {
      const data = await fs.readFile(CACHE_FILE, 'utf-8');
      this.cacheData = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty cache
      this.cacheData = {};
    }
  }

  private async save(): Promise<void> {
    try {
      await fs.writeFile(CACHE_FILE, JSON.stringify(this.cacheData, null, 2));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  get(appId: string): SensorTowerApp | null {
    const entry = this.cacheData[appId];
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    const now = Date.now();
    if (now - entry.timestamp > CACHE_EXPIRATION_MS) {
      delete this.cacheData[appId];
      this.save().catch(console.error);
      return null;
    }

    return entry.data;
  }

  async set(appId: string, data: SensorTowerApp): Promise<void> {
    this.cacheData[appId] = {
      data,
      timestamp: Date.now()
    };
    await this.save();
  }

  async clear(): Promise<void> {
    this.cacheData = {};
    await this.save();
  }

  getStats(): { totalEntries: number; validEntries: number } {
    const now = Date.now();
    let validEntries = 0;
    const totalEntries = Object.keys(this.cacheData).length;

    for (const entry of Object.values(this.cacheData)) {
      if (now - entry.timestamp <= CACHE_EXPIRATION_MS) {
        validEntries++;
      }
    }

    return { totalEntries, validEntries };
  }
}