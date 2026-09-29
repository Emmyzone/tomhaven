export const DEFAULT_FILTERS = {
  q: "",
  brand: "",
  condition: "",
  storage: "",
  minPrice: "",
  maxPrice: "",
  showSold: false,
  sort: "newest",
};

export function distinct(products, key) {
  const values = products
    .map((p) => p[key])
    .filter((v) => v && String(v).trim())
    .map((v) => String(v).trim());
  return [...new Set(values)].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

export function activeFilterCount(f) {
  return [f.brand, f.condition, f.storage, f.minPrice, f.maxPrice, f.showSold].filter(
    Boolean
  ).length;
}

export function applyFilters(products, f) {
  const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  const min = f.minPrice === "" ? null : Number(f.minPrice);
  const max = f.maxPrice === "" ? null : Number(f.maxPrice);

  const filtered = products.filter((p) => {
    if (!f.showSold && p.status === "sold") return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.condition && p.condition !== f.condition) return false;
    if (f.storage && p.storage !== f.storage) return false;
    if (min !== null && Number(p.price) < min) return false;
    if (max !== null && Number(p.price) > max) return false;
    if (terms.length) {
      const haystack = [p.name, p.brand, p.model, p.storage, p.colour, p.condition]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });

  const soldLast = (p) => (p.status === "sold" ? 1 : 0);
  const byDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
  const sorters = {
    newest: byDate,
    "price-asc": (a, b) => Number(a.price) - Number(b.price),
    "price-desc": (a, b) => Number(b.price) - Number(a.price),
  };
  const compare = sorters[f.sort] || byDate;
  return [...filtered].sort((a, b) => soldLast(a) - soldLast(b) || compare(a, b));
}
