import { THEMES, Theme } from "../../config/themes.js";

export interface ThemeStats {
  theme: Theme;
  generated: number;
}

export class ThemeQueue {
  private stats: ThemeStats[];

  constructor(initialCounts: Record<string, number> = {}) {
    this.stats = THEMES.map(theme => ({
      theme,
      generated: initialCounts[theme.name] ?? 0,
    }));
  }

  next(): ThemeStats {
    return [...this.stats].sort((a, b) => {
      const deficitA = a.theme.target - a.generated;
      const deficitB = b.theme.target - b.generated;
      return deficitB - deficitA;
    })[0];
  }

  increment(themeName: string, count: number): void {
    const stat = this.stats.find(s => s.theme.name === themeName);
    if (stat) stat.generated += count;
  }

  isComplete(): boolean {
    return this.stats.every(s => s.generated >= s.theme.target);
  }

  summary(): string {
    return this.stats
      .map(s => `${s.theme.name}: ${s.generated}/${s.theme.target}`)
      .join(" | ");
  }
}