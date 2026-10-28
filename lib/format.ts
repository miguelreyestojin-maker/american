export function formatGtq(amount: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}
