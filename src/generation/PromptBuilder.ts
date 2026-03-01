export class PromptBuilder {
  build(themeName: string, themeDescription: string, recentNames: string[]): string {
    const avoid = recentNames.slice(-40).join(", ");
    return `/no_think
Придумай 35 поэтических названий букетов на русском языке.
Тема: ${themeName} — ${themeDescription}.

Требования:
- Только русский язык, только кириллица
- Каждое название: 2-4 слова
- Красиво, поэтично, без банальностей
- Разнообразие: не повторяй слова и паттерны между названиями
${avoid ? `- Не использовать слова из этих названий: ${avoid}` : ""}

Ответ — только JSON array строк, без пояснений:
["Название 1", "Название 2", ...]`;
  }
}
