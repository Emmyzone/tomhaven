import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import usePageMeta from "../../hooks/usePageMeta";
import { signIn, signOut } from "../../services/authService";

function friendlyError(error) {
  const text = (error && error.message) || "";
  if (/invalid login credentials/i.test(text)) return "The email or password is incorrect.";
  if (/email not confirmed/i.test(text)) return "This email has not been confirmed yet. Confirm it in Supabase, then try again.";
  return "Could not log in. Check your internet connection and try again.";
}

export default function Login() {
  const { session, isAdmin, loading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  usePageMeta({ title: `Admin login | ${settings.business_name}` });

  // Go to the dashboard only once Supabase has confirmed this user is an admin.
  useEffect(() => {
    if (!loading && session && isAdmin) navigate("/admin", { replace: true });
  }, [loading, session, isAdmin, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  const notAdmin = !loading && session && !isAdmin;

  return (
    <main className="login-page">
      <div className="login-box">
        <p className="wordmark">{settings.business_name}</p>
        <h1>Admin login</h1>

        {notAdmin ? (
          <div className="notice notice-error" role="alert">
            <p>This account is not set up as an administrator.</p>
            <button type="button" className="btn btn-dark btn-sm" onClick={signOut}>
              Log out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate={false}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-dark btn-block" disabled={busy || loading}>
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>
        )}

        <Link to="/" className="text-link login-back">
          Back to website
        </Link>
      </div>
    </main>
  );
}
