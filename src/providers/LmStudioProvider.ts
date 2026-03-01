import { BaseProvider, GenerationResult } from "./BaseProvider.js";

// LM Studio uses OpenAI-compatible API
export class LmStudioProvider extends BaseProvider {
  private baseUrl: string;

  constructor(private modelId: string) {
    super();
    this.baseUrl = process.env.LM_STUDIO_BASE_URL ?? "http://localhost:1234/v1";
  }

  async generate(prompt: string, temperature: number, maxTokens: number): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });
    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content ?? "[]";
    const tokensUsed = data.usage?.total_tokens ?? 0;

    let names: string[] = [];
    try {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) names = JSON.parse(match[0]);
    } catch {
      names = [];
    }
    return { names, tokensUsed };
  }
}