import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";
import useProducts from "../hooks/useProducts";
import usePageMeta from "../hooks/usePageMeta";
import { generalMessage, productTitle, whatsappLink } from "../lib/format";
import Price from "../components/Price.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductImage from "../components/ProductImage.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import { ErrorState, ProductGridSkeleton } from "../components/StateMessage.jsx";

export default function Home() {
  const { settings } = useSettings();
  const { products, loading, error, reload } = useProducts();

  usePageMeta({
    title: `${settings.business_name} | Quality phones delivered across Nigeria`,
    description: `Explore available smartphones from ${settings.business_name} and order directly through WhatsApp. ${settings.delivery_text}.`,
  });

  const available = products.filter((p) => p.status === "available");
  const featured = available.slice(0, 4);
  const spotlight = available.find((p) => p.image_url) || available[0];
  const chatLink = whatsappLink(settings.whatsapp_number, generalMessage(settings));

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>Quality phones. Delivered across Nigeria.</h1>
            <p className="lead">
              Explore available smartphones from {settings.business_name} and order directly
              through WhatsApp.
            </p>
            <div className="btn-row">
              <Link to="/phones" className="btn btn-dark">
                Browse phones
              </Link>
              <WhatsAppButton href={chatLink}>Chat on WhatsApp</WhatsAppButton>
            </div>
            <p className="hero-note">{settings.delivery_text}.</p>
          </div>

          {loading && <div className="hero-panel skeleton" aria-hidden="true" />}
          {!loading && spotlight && (
            <Link to={`/product/${spotlight.id}`} className="hero-panel" aria-label={`View ${spotlight.name}`}>
              <div className="hero-image">
                <ProductImage src={spotlight.image_url} alt={spotlight.name} eager />
              </div>
              <div className="hero-panel-info">
                <div>
                  <p className="hero-panel-label">Available now</p>
                  <p className="hero-panel-name">{productTitle(spotlight)}</p>
                </div>
                <Price value={spotlight.price} currency={spotlight.currency} large />
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>Phones available now</h2>
            <Link to="/phones" className="text-link">
              See all phones
            </Link>
          </div>
          {loading && <ProductGridSkeleton />}
          {error && (
            <ErrorState
              message="The phones could not be loaded. Check your connection and try again."
              onRetry={reload}
            />
          )}
          {!loading && !error && featured.length === 0 && (
            <p className="muted">No phones are listed right now. Message us on WhatsApp to ask what is coming in.</p>
          )}
          {featured.length > 0 && (
            <div className="grid-products">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="block block-tint">
        <div className="wrap">
          <h2>How to order</h2>
          <ol className="steps">
            <li>
              <h3>Choose a phone</h3>
              <p>Browse the phones listed and open the one you like to see its details.</p>
            </li>
            <li>
              <h3>Message {settings.seller_name}</h3>
              <p>Tap Buy on WhatsApp. Your message already names the phone, so you only need to send it.</p>
            </li>
            <li>
              <h3>Confirm and receive</h3>
              <p>Confirm availability and delivery details in the chat. {settings.delivery_text}.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="block">
        <div className="wrap split">
          <div>
            <h2>Why shop with {settings.business_name}</h2>
          </div>
          <dl className="points">
            <div>
              <dt>Prices in naira</dt>
              <dd>Every phone shows its price up front.</dd>
            </div>
            <div>
              <dt>Talk to the seller</dt>
              <dd>Ask your questions directly on WhatsApp.</dd>
            </div>
            <div>
              <dt>Delivery across Nigeria</dt>
              <dd>Order from wherever you are.</dd>
            </div>
            <div>
              <dt>Clear availability</dt>
              <dd>Each listing shows whether the phone is available or sold.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="block block-tint">
        <div className="wrap split">
          <div>
            <h2>About {settings.business_name}</h2>
            <p className="lead-sm">{settings.about_text}</p>
            <Link to="/about" className="text-link">
              More about us
            </Link>
          </div>
          <div className="cta-box">
            <h3>Ready to order?</h3>
            <p>Send {settings.seller_name} a message to check availability.</p>
            <WhatsAppButton href={chatLink}>Chat on WhatsApp</WhatsAppButton>
          </div>
        </div>
      </section>
    </>
  );
}
