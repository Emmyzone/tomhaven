import { useEffect, useState } from "react";
import { useSettings } from "../../context/SettingsContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { errorMessage, whatsappDigits } from "../../lib/format";
import { updateSettings } from "../../services/settingsService";

export default function AdminSettings() {
  const { settings, refresh } = useSettings();
  const toast = useToast();
  const [values, setValues] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setValues(settings), [settings]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (whatsappDigits(values.whatsapp_number).length < 10) {
      return setError("Enter a full WhatsApp number, for example 09015129819.");
    }
    setSaving(true);
    try {
      await updateSettings({
        business_name: values.business_name.trim(),
        seller_name: values.seller_name.trim(),
        whatsapp_number: values.whatsapp_number.trim(),
        delivery_text: values.delivery_text.trim(),
        about_text: values.about_text.trim(),
      });
      await refresh();
      toast.success("Business information saved successfully.");
    } catch (err) {
      setError(errorMessage(err, "Could not save the business information."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>Business information</h1>
      <p className="muted">These details appear across the website and in WhatsApp messages.</p>
      <form className="editor" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="business_name">Business name</label>
            <input id="business_name" required value={values.business_name} onChange={set("business_name")} />
          </div>
          <div className="field">
            <label htmlFor="seller_name">Seller name</label>
            <input id="seller_name" required value={values.seller_name} onChange={set("seller_name")} />
          </div>
          <div className="field">
            <label htmlFor="whatsapp_number">WhatsApp number</label>
            <input
              id="whatsapp_number"
              type="tel"
              required
              value={values.whatsapp_number}
              onChange={set("whatsapp_number")}
            />
          </div>
          <div className="field">
            <label htmlFor="delivery_text">Delivery message</label>
            <input id="delivery_text" required value={values.delivery_text} onChange={set("delivery_text")} />
          </div>
          <div className="field span-2">
            <label htmlFor="about_text">About text</label>
            <textarea id="about_text" rows="5" required value={values.about_text} onChange={set("about_text")} />
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
