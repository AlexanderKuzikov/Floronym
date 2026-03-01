import { ProviderManager } from "../providers/ProviderManager.js";
import { ThemeQueue } from "./ThemeQueue.js";
import { PromptBuilder } from "./PromptBuilder.js";
import { Validator } from "../validation/Validator.js";
import { NameStore } from "../store/NameStore.js";
import { RateLimiter } from "../core/RateLimiter.js";
import { logger } from "../core/Logger.js";

const ESTIMATED_TOKENS = 400;

export class Generator {
  private running = false;
  private providerManager = new ProviderManager();
  private promptBuilder = new PromptBuilder();
  private validator = new Validator();
  private rateLimiter = new RateLimiter();

  async run(store: NameStore): Promise<void> {
    this.running = true;
    const queue = new ThemeQueue(store.countByTheme());

    logger.info("Generator started");
    logger.info(queue.summary());

    while (this.running && !queue.isComplete()) {
      const themeStat = queue.next();
      const { theme } = themeStat;

      const slot = await this.providerManager.waitForAvailability(ESTIMATED_TOKENS);
      const prompt = this.promptBuilder.build(theme.name, theme.description, store.getRecent(40));

      try {
        const result = await this.rateLimiter.withRetry(() =>
          slot.provider.generate(prompt, slot.model.temperature, slot.model.maxTokens)
        );

        slot.budget.record(result.tokensUsed);

        const { valid, rejected } = this.validator.filterBatch(result.names);
        const added = store.addBatch(valid, theme.name, slot.model.id);
        queue.increment(theme.name, added);

        const rejRate = result.names.length > 0
          ? Math.round((rejected / result.names.length) * 100)
          : 0;

        logger.info(
          `[${slot.model.id}] theme=${theme.name} raw=${result.names.length} ` +
          `valid=${valid.length} added=${added} rejected=${rejRate}% ` +
          `tokens=${result.tokensUsed} total=${store.size()}`
        );

        if (rejRate > 60) {
          logger.warn("High rejection rate, skipping to next theme");
          continue;
        }

        await this.rateLimiter.sleep(500);
      } catch (err: any) {
        logger.error(`Generation error: ${err.message}`);
        await this.rateLimiter.sleep(3000);
      }
    }

    store.save();
    logger.info(`Done! Total names: ${store.size()}`);
    logger.info(queue.summary());
  }

  stop(): void {
    this.running = false;
  }
}