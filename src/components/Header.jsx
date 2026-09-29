import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";
import { generalMessage, whatsappLink } from "../lib/format";
import WhatsAppButton from "./WhatsAppButton.jsx";

const LINKS = [
  ["/", "Home"],
  ["/phones", "Phones"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

export default function Header() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="/" className="wordmark" aria-label={`${settings.business_name} home`}>
          {settings.business_name}
        </Link>

        <nav id="site-nav" className={`site-nav${open ? " open" : ""}`} aria-label="Main">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
          <WhatsAppButton
            className="btn btn-primary btn-sm nav-cta"
            href={whatsappLink(settings.whatsapp_number, generalMessage(settings))}
          >
            Chat on WhatsApp
          </WhatsAppButton>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
