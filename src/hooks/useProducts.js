import { useCallback, useEffect, useState } from "react";
import { listProducts } from "../services/productService";

export default function useProducts({ category = "phone" } = {}) {
  const [state, setState] = useState({ products: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const products = await listProducts({ category });
      setState({ products, loading: false, error: null });
    } catch (error) {
      setState({ products: [], loading: false, error });
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  // "loading" is only true on the first load, so lists don't blank out when refreshed.
  return {
    products: state.products,
    loading: state.loading && state.products.length === 0,
    error: state.error,
    reload: load,
  };
}
