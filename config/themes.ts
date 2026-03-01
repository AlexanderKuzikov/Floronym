export interface Theme {
  name: string;
  target: number;
  description: string;
}

export const THEMES: Theme[] = [
  { name: "природа",     target: 800, description: "природные явления, времена года, пейзажи, стихии" },
  { name: "эмоции",      target: 600, description: "чувства, состояния души, переживания, настроения" },
  { name: "цвет",        target: 500, description: "цвет, свет, тени, оттенки, сияние" },
  { name: "мифология",   target: 400, description: "мифы, поэзия, легенды, сказания, архетипы" },
  { name: "имена",       target: 400, description: "женские имена, богини, музы, исторические образы" },
  { name: "музыка",      target: 300, description: "музыка, танец, ритм, мелодия, искусство" },
  { name: "путешествия", target: 300, description: "города, страны, места, дороги, горизонты" },
];