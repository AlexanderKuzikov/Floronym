export class Validator {
  private readonly MIN_WORDS = 2;
  private readonly MAX_WORDS = 4;
  private readonly MIN_WORD_LEN = 3;
  private readonly CYRILLIC = /^[а-яёА-ЯЁ\s\-]+$/;
  private readonly HAS_FOREIGN = /[a-zA-Z0-9一-鿿぀-ヿ]/;

  validate(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (this.HAS_FOREIGN.test(trimmed)) return false;
    if (!this.CYRILLIC.test(trimmed)) return false;

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < this.MIN_WORDS || words.length > this.MAX_WORDS) return false;
    if (words.some(w => w.replace(/-/g, "").length < this.MIN_WORD_LEN)) return false;

    // Нет повторяющихся слов внутри одного названия
    const lower = words.map(w => w.toLowerCase());
    if (new Set(lower).size !== lower.length) return false;

    return true;
  }

  filterBatch(names: string[]): { valid: string[]; rejected: number } {
    const valid = names.filter(n => this.validate(n));
    return { valid, rejected: names.length - valid.length };
  }
}