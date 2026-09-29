import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";
import usePageMeta from "../hooks/usePageMeta";
import { getProduct } from "../services/productService";
import {
  formatPrice,
  generalMessage,
  productMessage,
  productTitle,
  specRows,
  whatsappLink,
} from "../lib/format";
import Price from "../components/Price.jsx";
import ProductImage from "../components/ProductImage.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/StateMessage.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { settings } = useSettings();
  const [state, setState] = useState({ product: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState({ product: null, loading: true, error: null });
    try {
      const product = await getProduct(id);
      setState({ product, loading: false, error: null });
    } catch (error) {
      setState({ product: null, loading: false, error });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const { product, loading, error } = state;

  usePageMeta({
    title: product
      ? `${productTitle(product)} | ${settings.business_name}`
      : `Phone | ${settings.business_name}`,
    description: product
      ? product.description ||
        `${productTitle(product)} for ${formatPrice(product.price, product.currency)}. Order on WhatsApp. ${settings.delivery_text}.`
      : undefined,
    image: product?.image_url,
    type: "product",
  });

  if (loading) {
    return (
      <div className="wrap page">
        <LoadingState label="Loading phone" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="wrap page">
        <ErrorState message="This phone could not be loaded. Check your connection and try again." onRetry={load} />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="wrap page">
        <EmptyState title="Phone not found">
          It may have been removed. <Link to="/phones" className="text-link">See all phones</Link>
        </EmptyState>
      </div>
    );
  }

  const sold = product.status === "sold";
  const specs = specRows(product);
  const buyLink = whatsappLink(settings.whatsapp_number, productMessage(product, settings));
  const askLink = whatsappLink(settings.whatsapp_number, generalMessage(settings));

  return (
    <div className="wrap page detail-page">
      <Link to="/phones" className="back-link">
        All phones
      </Link>

      <div className="detail-grid">
        <div className={`detail-image tile${sold ? " is-sold" : ""}`}>
          <ProductImage src={product.image_url} alt={product.name} eager />
        </div>

        <div className="detail-info">
          <h1>{productTitle(product)}</h1>
          <div className="detail-price">
            <Price value={product.price} currency={product.currency} large />
            <span className={`status status-${product.status}`}>{sold ? "Sold" : "Available"}</span>
          </div>

          {specs.length > 0 && (
            <section aria-labelledby="specs-title">
              <h2 id="specs-title" className="h-small">
                Specifications
              </h2>
              <dl className="specs">
                {specs.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {product.description && <p className="detail-description">{product.description}</p>}

          <div className="detail-cta">
            {sold ? (
              <>
                <button type="button" className="btn btn-muted" disabled>
                  This phone has been sold
                </button>
                <WhatsAppButton className="btn btn-ghost" href={askLink}>
                  Ask about similar phones
                </WhatsAppButton>
              </>
            ) : (
              <WhatsAppButton href={buyLink}>Buy on WhatsApp</WhatsAppButton>
            )}
          </div>
          <p className="muted">{settings.delivery_text}.</p>
        </div>
      </div>

      <div className="buy-bar">
        <Price value={product.price} currency={product.currency} large />
        {sold ? (
          <button type="button" className="btn btn-muted" disabled>
            Sold
          </button>
        ) : (
          <WhatsAppButton href={buyLink}>Buy on WhatsApp</WhatsAppButton>
        )}
      </div>
    </div>
  );
}
