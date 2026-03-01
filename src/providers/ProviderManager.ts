import { MODELS, ModelConfig } from "../../config/models.js";
import { TokenBudget } from "../core/TokenBudget.js";
import { GroqProvider } from "./GroqProvider.js";
import { LmStudioProvider } from "./LmStudioProvider.js";
import { BaseProvider } from "./BaseProvider.js";
import { logger } from "../core/Logger.js";

export class ProviderManager {
  private budgets: Map<string, TokenBudget> = new Map();
  private providers: Map<string, BaseProvider> = new Map();

  constructor() {
    for (const model of MODELS) {
      this.budgets.set(model.id, new TokenBudget({
        tokensPerMinute: model.limits.tokensPerMinute,
        tokensPerDay: model.limits.tokensPerDay,
      }));
      if (model.provider === "groq") {
        this.providers.set(model.id, new GroqProvider(model.id));
      } else {
        this.providers.set(model.id, new LmStudioProvider(model.id));
      }
    }
  }

  getAvailableModel(estimatedTokens: number): { model: ModelConfig; provider: BaseProvider; budget: TokenBudget } | null {
    const sorted = [...MODELS].sort((a, b) => a.priority - b.priority);
    for (const model of sorted) {
      const budget = this.budgets.get(model.id)!;
      if (budget.dayExhausted()) {
        logger.debug(`Model ${model.id} day budget exhausted`);
        continue;
      }
      if (budget.canSpend(estimatedTokens)) {
        return { model, provider: this.providers.get(model.id)!, budget };
      }
    }
    return null;
  }

  async waitForAvailability(estimatedTokens: number): Promise<{ model: ModelConfig; provider: BaseProvider; budget: TokenBudget }> {
    while (true) {
      const result = this.getAvailableModel(estimatedTokens);
      if (result) return result;
      logger.info("All models at limit, waiting 10s...");
      await new Promise(r => setTimeout(r, 10_000));
    }
  }
}