const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return uuidPattern.test(value);
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 8) {
    return `502${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("502")) {
    return digits;
  }

  return null;
}

export function whatsAppHref(
  phone: string,
  customerName: string,
  productTitle: string,
) {
  const text = `Hola ${customerName}, te escribimos de AMERICAN por tu solicitud de "${productTitle}".`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
