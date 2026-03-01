export interface GenerationResult {
  names: string[];
  tokensUsed: number;
}

export abstract class BaseProvider {
  abstract generate(prompt: string, temperature: number, maxTokens: number): Promise<GenerationResult>;
}