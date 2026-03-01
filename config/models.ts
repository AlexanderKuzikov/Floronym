export interface ModelLimits {
  requestsPerMinute: number;
  requestsPerDay: number;
  tokensPerMinute: number;
  tokensPerDay: number;
}

export interface ModelConfig {
  id: string;
  provider: "groq" | "lmstudio";
  priority: number;
  limits: ModelLimits;
  temperature: number;
  maxTokens: number;
}

export const MODELS: ModelConfig[] = [
  {
    id: "qwen/qwen3-32b",
    provider: "groq",
    priority: 1,
    limits: { requestsPerMinute: 60, requestsPerDay: 1000, tokensPerMinute: 6000, tokensPerDay: 500_000 },
    temperature: 1.1,
    maxTokens: 400,
  },
  {
    id: "openai/gpt-oss-120b",
    provider: "groq",
    priority: 2,
    limits: { requestsPerMinute: 30, requestsPerDay: 1000, tokensPerMinute: 8000, tokensPerDay: 200_000 },
    temperature: 1.0,
    maxTokens: 400,
  },
  {
    id: "moonshotai/kimi-k2-instruct",
    provider: "groq",
    priority: 3,
    limits: { requestsPerMinute: 60, requestsPerDay: 1000, tokensPerMinute: 10000, tokensPerDay: 300_000 },
    temperature: 1.0,
    maxTokens: 400,
  },
  {
    id: "llama-3.3-70b-versatile",
    provider: "groq",
    priority: 4,
    limits: { requestsPerMinute: 30, requestsPerDay: 1000, tokensPerMinute: 12000, tokensPerDay: 100_000 },
    temperature: 1.0,
    maxTokens: 400,
  },
  {
    id: "llama-3.1-8b-instant",
    provider: "groq",
    priority: 5,
    limits: { requestsPerMinute: 30, requestsPerDay: 14400, tokensPerMinute: 6000, tokensPerDay: 500_000 },
    temperature: 1.1,
    maxTokens: 400,
  },
];