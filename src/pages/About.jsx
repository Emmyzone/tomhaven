import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";
import usePageMeta from "../hooks/usePageMeta";
import { generalMessage, whatsappLink } from "../lib/format";
import WhatsAppButton from "../components/WhatsAppButton.jsx";

export default function About() {
  const { settings } = useSettings();
  usePageMeta({
    title: `About ${settings.business_name}`,
    description: settings.about_text,
  });

  return (
    <div className="wrap page narrow">
      <h1>About {settings.business_name}</h1>
      <p className="lead-sm">{settings.about_text}</p>
      <p>{settings.delivery_text}.</p>
      <div className="btn-row">
        <Link to="/phones" className="btn btn-dark">
          Browse phones
        </Link>
        <WhatsAppButton href={whatsappLink(settings.whatsapp_number, generalMessage(settings))}>
          Chat on WhatsApp
        </WhatsAppButton>
      </div>
    </div>
  );
}
