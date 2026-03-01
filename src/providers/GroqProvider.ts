import Groq from "groq-sdk";
import { BaseProvider, GenerationResult } from "./BaseProvider.js";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

function extractNames(text: string): string[] {
  if (!text) return [];
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();
  const source = cleaned || text;
  try {
    const match = source.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return [];
}

export class GroqProvider extends BaseProvider {
  constructor(private modelId: string) {
    super();
  }

  async generate(prompt: string, temperature: number, maxTokens: number): Promise<GenerationResult> {
    const response = await client.chat.completions.create({
      model: this.modelId,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: maxTokens,
    });

    const choice = response.choices[0];
    const tokensUsed = response.usage?.total_tokens ?? 0;

    const content = choice?.message?.content ?? "";
    const reasoning = (choice?.message as any)?.reasoning_content ?? "";

    let names = extractNames(content);
    if (names.length === 0 && reasoning) {
      names = extractNames(reasoning);
    }

    return { names, tokensUsed };
  }
}
