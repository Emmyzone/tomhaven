import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";

export default function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <div>
          <p className="wordmark">{settings.business_name}</p>
          <p className="footer-note">{settings.delivery_text}.</p>
        </div>
        <div className="footer-links">
          <Link to="/phones">Phones</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        
        </div>
      </div>
      <div className="wrap footer-base">
        © {new Date().getFullYear()} {settings.business_name}
      </div>
    </footer>
  );
}
