import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";
import { signOut } from "../services/authService";
import usePageMeta from "../hooks/usePageMeta";

export default function AdminLayout() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  usePageMeta({ title: `Admin | ${settings.business_name}` });

  // Keep the admin area out of search engines.
  useEffect(() => {
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex, nofollow";
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  async function handleLogout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <div className="wrap admin-bar-row">
          <span className="wordmark">
            {settings.business_name} <span className="admin-tag">Admin</span>
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <nav className="wrap admin-tabs" aria-label="Admin">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" end>
            Products
          </NavLink>
          <NavLink to="/admin/products/new">Add product</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
      </header>
      <main className="wrap admin-main">
        <Outlet />
      </main>
    </div>
  );
}
