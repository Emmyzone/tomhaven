import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";
import { productMessage, whatsappLink } from "../lib/format";
import Price from "./Price.jsx";
import ProductImage from "./ProductImage.jsx";
import WhatsAppButton from "./WhatsAppButton.jsx";

export default function ProductCard({ product }) {
  const { settings } = useSettings();
  const sold = product.status === "sold";
  const details = [product.storage, product.condition].filter(Boolean);

  return (
    <article className={`product-card${sold ? " is-sold" : ""}`}>
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="tile">
          <ProductImage src={product.image_url} alt={product.name} />
        </div>
        <h3 className="product-name">{product.name}</h3>
        {details.length > 0 && (
          <p className="product-details">
            {details.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </p>
        )}
        <Price value={product.price} currency={product.currency} />
      </Link>

      <div className="product-actions">
        <span className={`status status-${product.status}`}>{sold ? "Sold" : "Available"}</span>
        {sold ? (
          <button type="button" className="btn btn-muted btn-sm" disabled>
            Sold
          </button>
        ) : (
          <WhatsAppButton
            className="btn btn-primary btn-sm"
            href={whatsappLink(settings.whatsapp_number, productMessage(product, settings))}
          >
            Buy on WhatsApp
          </WhatsAppButton>
        )}
      </div>
    </article>
  );
}
