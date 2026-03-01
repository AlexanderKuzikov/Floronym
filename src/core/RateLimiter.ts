import { logger } from "./Logger.js";

export class RateLimiter {
  async withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
    let delay = 2000;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        const status = err?.status ?? err?.statusCode;
        if (status === 429 && attempt < maxRetries) {
          const retryAfter = parseInt(err?.headers?.["retry-after"] ?? "0") * 1000 || delay;
          logger.warn(`Rate limited, waiting ${retryAfter}ms (attempt ${attempt + 1})`);
          await this.sleep(retryAfter);
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
    throw new Error("Max retries exceeded");
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}