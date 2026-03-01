export interface BudgetConfig {
  tokensPerMinute: number;
  tokensPerDay: number;
}

interface TokenEvent {
  tokens: number;
  timestamp: number;
}

export class TokenBudget {
  private events: TokenEvent[] = [];

  constructor(private config: BudgetConfig) {}

  canSpend(tokens: number): boolean {
    this.cleanup();
    const now = Date.now();
    const lastMinute = this.events
      .filter(e => now - e.timestamp < 60_000)
      .reduce((sum, e) => sum + e.tokens, 0);
    const lastDay = this.events
      .filter(e => now - e.timestamp < 86_400_000)
      .reduce((sum, e) => sum + e.tokens, 0);
    return lastMinute + tokens <= this.config.tokensPerMinute &&
           lastDay + tokens <= this.config.tokensPerDay;
  }

  record(tokens: number): void {
    this.events.push({ tokens, timestamp: Date.now() });
  }

  msUntilAvailable(tokens: number): number {
    this.cleanup();
    const now = Date.now();
    const minuteEvents = this.events.filter(e => now - e.timestamp < 60_000);
    const minuteUsed = minuteEvents.reduce((sum, e) => sum + e.tokens, 0);
    if (minuteUsed + tokens > this.config.tokensPerMinute && minuteEvents.length > 0) {
      const oldest = Math.min(...minuteEvents.map(e => e.timestamp));
      return 60_000 - (now - oldest) + 100;
    }
    return 0;
  }

  dayExhausted(): boolean {
    this.cleanup();
    const now = Date.now();
    const lastDay = this.events
      .filter(e => now - e.timestamp < 86_400_000)
      .reduce((sum, e) => sum + e.tokens, 0);
    return lastDay >= this.config.tokensPerDay * 0.95;
  }

  private cleanup(): void {
    const cutoff = Date.now() - 86_400_000;
    this.events = this.events.filter(e => e.timestamp > cutoff);
  }
}