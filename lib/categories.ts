export const categories = [
  "Calzado",
  "Ropa",
  "Accesorios",
  "Electrónica",
] as const;

export type Category = (typeof categories)[number];

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value);
}
