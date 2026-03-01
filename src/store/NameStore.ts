import fs from "fs";
import path from "path";
import { logger } from "../core/Logger.js";

export interface NameEntry {
  name: string;
  theme: string;
  model: string;
  createdAt: string;
}

interface NamesFile {
  meta: {
    total: number;
    byTheme: Record<string, number>;
    lastUpdated: string;
  };
  names: NameEntry[];
}

export class NameStore {
  private names: NameEntry[] = [];
  private normalizedSet: Set<string> = new Set();
  private readonly filePath: string;
  private unsavedCount = 0;
  private readonly autosaveEvery: number;

  constructor() {
    this.filePath = process.env.NAMES_FILE ?? "data/names.json";
    this.autosaveEvery = parseInt(process.env.AUTOSAVE_EVERY ?? "100");
  }

  load(): void {
    if (fs.existsSync(this.filePath)) {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);
      // Support both old flat array and new format
      this.names = Array.isArray(parsed) ? parsed : parsed.names ?? [];
      for (const entry of this.names) {
        this.normalizedSet.add(this.normalize(entry.name));
      }
      logger.info(`Loaded ${this.names.length} names from ${this.filePath}`);
    } else {
      logger.info("No existing names file, starting fresh");
    }
  }

  has(name: string): boolean {
    return this.normalizedSet.has(this.normalize(name));
  }

  add(name: string, theme: string, model: string): boolean {
    if (this.has(name)) return false;
    const entry: NameEntry = {
      name: name.trim(),
      theme,
      model,
      createdAt: new Date().toISOString(),
    };
    this.names.push(entry);
    this.normalizedSet.add(this.normalize(name));
    this.unsavedCount++;
    if (this.unsavedCount >= this.autosaveEvery) this.save();
    return true;
  }

  addBatch(names: string[], theme: string, model: string): number {
    let added = 0;
    for (const name of names) {
      if (this.add(name, theme, model)) added++;
    }
    return added;
  }

  save(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const byTheme = this.countByTheme();

    const file: NamesFile = {
      meta: {
        total: this.names.length,
        byTheme,
        lastUpdated: new Date().toISOString(),
      },
      names: this.names,
    };

    fs.writeFileSync(this.filePath, JSON.stringify(file, null, 2), "utf-8");
    this.unsavedCount = 0;
    logger.info(`Saved ${this.names.length} names | ${JSON.stringify(byTheme)}`);
  }

  size(): number { return this.names.length; }

  countByTheme(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const entry of this.names) {
      counts[entry.theme] = (counts[entry.theme] ?? 0) + 1;
    }
    return counts;
  }

  getRecent(n: number): string[] {
    return this.names.slice(-n).map(e => e.name);
  }

  private normalize(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
  }
}
