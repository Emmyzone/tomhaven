import { useMemo, useState } from "react";
import { useSettings } from "../context/SettingsContext.jsx";
import useProducts from "../hooks/useProducts";
import usePageMeta from "../hooks/usePageMeta";
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  applyFilters,
  distinct,
} from "../lib/catalog";
import ProductCard from "../components/ProductCard.jsx";
import { EmptyState, ErrorState, ProductGridSkeleton } from "../components/StateMessage.jsx";

export default function Phones() {
  const { settings } = useSettings();
  const { products, loading, error, reload } = useProducts();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);

  usePageMeta({
    title: `Phones | ${settings.business_name}`,
    description: `Browse smartphones available from ${settings.business_name}. Search by brand or model and order on WhatsApp.`,
  });

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const brands = useMemo(() => distinct(products, "brand"), [products]);
  const conditions = useMemo(() => distinct(products, "condition"), [products]);
  const storages = useMemo(() => distinct(products, "storage"), [products]);
  const results = useMemo(() => applyFilters(products, filters), [products, filters]);
  const activeCount = activeFilterCount(filters);
  const hasFilters = activeCount > 0 || filters.q.trim() !== "";

  return (
    <div className="wrap page">
      <h1>Phones</h1>

      <div className="toolbar">
        <div className="search">
          <label htmlFor="search" className="sr-only">
            Search phones
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search by brand or model, e.g. iPhone 14 Pro"
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          aria-expanded={panelOpen}
          aria-controls="filters"
          onClick={() => setPanelOpen((o) => !o)}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <div className="sort">
          <label htmlFor="sort" className="sr-only">
            Sort phones
          </label>
          <select id="sort" value={filters.sort} onChange={(e) => set("sort", e.target.value)}>
            <option value="newest">Newest added</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {panelOpen && (
        <div id="filters" className="filters">
          <div className="field">
            <label htmlFor="f-brand">Brand</label>
            <select id="f-brand" value={filters.brand} onChange={(e) => set("brand", e.target.value)}>
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-condition">Condition</label>
            <select
              id="f-condition"
              value={filters.condition}
              onChange={(e) => set("condition", e.target.value)}
            >
              <option value="">Any condition</option>
              {conditions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-storage">Storage</label>
            <select id="f-storage" value={filters.storage} onChange={(e) => set("storage", e.target.value)}>
              <option value="">Any storage</option>
              {storages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-min">Lowest price (₦)</label>
            <input
              id="f-min"
              type="number"
              inputMode="numeric"
              min="0"
              value={filters.minPrice}
              onChange={(e) => set("minPrice", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="f-max">Highest price (₦)</label>
            <input
              id="f-max"
              type="number"
              inputMode="numeric"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => set("maxPrice", e.target.value)}
            />
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={filters.showSold}
              onChange={(e) => set("showSold", e.target.checked)}
            />
            Show sold phones
          </label>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Clear all
          </button>
        </div>
      )}

      {loading && <ProductGridSkeleton count={8} />}
      {error && (
        <ErrorState
          message="The phones could not be loaded. Check your connection and try again."
          onRetry={reload}
        />
      )}

      {!loading && !error && (
        <>
          <p className="result-count" aria-live="polite">
            {results.length} {results.length === 1 ? "phone" : "phones"}
          </p>
          {results.length === 0 ? (
            <EmptyState title={hasFilters ? "No phones match your search" : "No phones listed yet"}>
              {hasFilters
                ? "Try a different search or clear the filters."
                : "New phones will appear here as soon as they are added."}
            </EmptyState>
          ) : (
            <div className="grid-products">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
