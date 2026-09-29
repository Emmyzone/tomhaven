import { useSettings } from "../context/SettingsContext.jsx";
import usePageMeta from "../hooks/usePageMeta";
import { generalMessage, whatsappLink } from "../lib/format";
import WhatsAppButton from "../components/WhatsAppButton.jsx";

export default function Contact() {
  const { settings } = useSettings();
  usePageMeta({
    title: `Contact ${settings.business_name}`,
    description: `Contact ${settings.seller_name} of ${settings.business_name} on WhatsApp. ${settings.delivery_text}.`,
  });

  return (
    <div className="wrap page narrow">
      <h1>Contact</h1>
      <dl className="contact-list">
        <div>
          <dt>Business</dt>
          <dd>{settings.business_name}</dd>
        </div>
        <div>
          <dt>Seller</dt>
          <dd>{settings.seller_name}</dd>
        </div>
        <div>
          <dt>WhatsApp</dt>
          <dd>{settings.whatsapp_number}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{settings.delivery_text}</dd>
        </div>
      </dl>
      <WhatsAppButton href={whatsappLink(settings.whatsapp_number, generalMessage(settings))}>
        Chat on WhatsApp
      </WhatsAppButton>
    </div>
  );
}
