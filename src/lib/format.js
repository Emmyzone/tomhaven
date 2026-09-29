const SYMBOLS = { NGN: "₦" };

export function splitPrice(value, currency = "NGN") {
  const n = Number(value);
  const amount = Number.isFinite(n)
    ? new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(n)
    : "";
  return { symbol: SYMBOLS[currency] ?? `${currency} `, amount };
}

export function formatPrice(value, currency = "NGN") {
  const { symbol, amount } = splitPrice(value, currency);
  return `${symbol}${amount}`;
}

// 09015129819 -> 2349015129819 (the format wa.me needs)
export function whatsappDigits(number) {
  let digits = String(number || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(number, message) {
  const base = `https://wa.me/${whatsappDigits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// "iPhone 14 Pro" + "128GB" -> "iPhone 14 Pro 128GB" (no repeat if the name already has it)
export function productTitle(product) {
  const name = product.name || "";
  const storage = product.storage ? String(product.storage) : "";
  if (storage && !name.toLowerCase().includes(storage.toLowerCase())) {
    return `${name} ${storage}`;
  }
  return name;
}

export function productMessage(product, settings) {
  const price = formatPrice(product.price, product.currency);
  return `Hello ${settings.seller_name}, I'm interested in the ${productTitle(product)} listed on the ${settings.business_name} website for ${price}. Is it still available?`;
}

export function generalMessage(settings) {
  return `Hello ${settings.seller_name}, I visited the ${settings.business_name} website and would like to ask about your phones.`;
}

// Only fields that have a value. Empty specs are never shown.
export function specRows(product) {
  const rows = [
    ["Model", product.model],
    ["Brand", product.brand],
    ["Storage", product.storage],
    ["RAM", product.ram],
    ["Condition", product.condition],
    ["Colour", product.colour],
    ["Battery health", product.battery_health],
    ["SIM", product.sim_type],
    ["Network", product.network_status],
  ];
  return rows
    .filter(([, value]) => value && String(value).trim())
    .map(([label, value]) => ({ label, value }));
}

export function errorMessage(error, fallback) {
  const text = error && error.message ? error.message : "";
  return text ? `${fallback} ${text}` : fallback;
}
