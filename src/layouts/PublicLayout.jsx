import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { generalMessage, whatsappLink } from "../lib/format";

export default function PublicLayout() {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  // Product pages already have their own Buy button bar on phones.
  const showFloating = !pathname.startsWith("/product/");

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      {showFloating && (
        <WhatsAppButton
          className="fab"
          href={whatsappLink(settings.whatsapp_number, generalMessage(settings))}
          aria-label="Chat on WhatsApp"
        >
          <span className="sr-only">Chat on WhatsApp</span>
        </WhatsAppButton>
      )}
    </>
  );
}
