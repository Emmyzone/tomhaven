import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErrorState, LoadingState } from "../../components/StateMessage.jsx";
import ProductImage from "../../components/ProductImage.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { errorMessage, formatPrice } from "../../lib/format";
import {
  deleteProductImage,
  uploadProductImage,
  validateImage,
} from "../../services/imageService";
import { createProduct, getProduct, updateProduct } from "../../services/productService";

const EMPTY = {
  name: "",
  brand: "",
  model: "",
  price: "",
  storage: "",
  ram: "",
  condition: "",
  colour: "",
  battery_health: "",
  sim_type: "",
  network_status: "",
  description: "",
  status: "available",
};

const OPTIONAL = [
  "brand",
  "model",
  "storage",
  "ram",
  "condition",
  "colour",
  "battery_health",
  "sim_type",
  "network_status",
  "description",
];

export default function ProductEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(EMPTY);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isEdit) return undefined;
    let active = true;
    (async () => {
      try {
        const product = await getProduct(id);
        if (!active) return;
        if (!product) {
          setLoadError("This product could not be found.");
          return;
        }
        const next = { ...EMPTY };
        Object.keys(EMPTY).forEach((key) => {
          if (product[key] !== null && product[key] !== undefined) next[key] = String(product[key]);
        });
        setExisting(product);
        setValues(next);
      } catch (err) {
        if (active) setLoadError(errorMessage(err, "The product could not be loaded."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  function handleFile(e) {
    const chosen = e.target.files?.[0];
    setImageError("");
    if (!chosen) {
      setFile(null);
      return;
    }
    const problem = validateImage(chosen);
    if (problem) {
      setImageError(problem);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(chosen);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const name = values.name.trim();
    const price = Number(values.price);
    if (!name) return setFormError("Enter the phone name.");
    if (values.price === "" || !Number.isFinite(price) || price < 0) {
      return setFormError("Enter a valid price in naira, for example 735000.");
    }

    setSaving(true);
    let uploaded = null;
    try {
      if (file) uploaded = await uploadProductImage(file);

      const payload = { name, price, status: values.status };
      OPTIONAL.forEach((key) => {
        payload[key] = values[key].trim() || null;
      });
      if (uploaded) {
        payload.image_url = uploaded.url;
        payload.image_path = uploaded.path;
      }

      if (isEdit) {
        await updateProduct(id, payload);
        if (uploaded && existing?.image_path) await deleteProductImage(existing.image_path);
        toast.success("Product updated successfully.");
      } else {
        await createProduct({ ...payload, category: "phone" });
        toast.success("Product added successfully.");
      }
      navigate("/admin/products");
    } catch (err) {
      if (uploaded) await deleteProductImage(uploaded.path); // do not leave an orphan photo
      setFormError(errorMessage(err, "Could not save the product."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading product" />;
  if (loadError) return <ErrorState message={loadError} />;

  const priceNumber = Number(values.price);
  const showPriceHint = values.price !== "" && Number.isFinite(priceNumber) && priceNumber >= 0;
  const currentImage = preview || existing?.image_url;

  return (
    <div>
      <div className="page-head">
        <h1>{isEdit ? "Edit phone" : "Add phone"}</h1>
        <Link to="/admin/products" className="text-link">
          Back to products
        </Link>
      </div>

      <form className="editor" onSubmit={handleSubmit}>
        <fieldset className="editor-group">
          <legend>Photo</legend>
          <div className="editor-photo">
            <div className="tile editor-tile">
              <ProductImage src={currentImage} alt={values.name || "New phone"} eager />
            </div>
            <div className="field">
              <label htmlFor="photo">{existing?.image_url ? "Replace photo" : "Upload photo"}</label>
              <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
              <p className="hint">JPG, PNG or WebP, up to 10 MB. It is resized automatically.</p>
              {imageError && (
                <p className="form-error" role="alert">
                  {imageError}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="editor-group">
          <legend>Main details</legend>
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="name">Phone name (required)</label>
              <input id="name" required value={values.name} onChange={set("name")} placeholder="iPhone 14 Pro" />
            </div>
            <div className="field">
              <label htmlFor="price">Price in naira (required)</label>
              <input
                id="price"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                required
                value={values.price}
                onChange={set("price")}
                placeholder="735000"
              />
              {showPriceHint && <p className="hint">Shown to customers as {formatPrice(priceNumber)}</p>}
            </div>
            <div className="field">
              <label htmlFor="status">Availability</label>
              <select id="status" value={values.status} onChange={set("status")}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="editor-group">
          <legend>More details (optional)</legend>
          <p className="hint">Leave a field empty and it will not appear on the website.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="brand">Brand</label>
              <input id="brand" value={values.brand} onChange={set("brand")} placeholder="Apple" />
            </div>
            <div className="field">
              <label htmlFor="model">Model</label>
              <input id="model" value={values.model} onChange={set("model")} />
            </div>
            <div className="field">
              <label htmlFor="storage">Storage</label>
              <input id="storage" list="storage-options" value={values.storage} onChange={set("storage")} />
              <datalist id="storage-options">
                <option value="64GB" />
                <option value="128GB" />
                <option value="256GB" />
                <option value="512GB" />
                <option value="1TB" />
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="ram">RAM</label>
              <input id="ram" value={values.ram} onChange={set("ram")} placeholder="6GB" />
            </div>
            <div className="field">
              <label htmlFor="condition">Condition</label>
              <select id="condition" value={values.condition} onChange={set("condition")}>
                <option value="">Not specified</option>
                <option>New</option>
                <option>Used</option>
                <option>Refurbished</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="colour">Colour</label>
              <input id="colour" value={values.colour} onChange={set("colour")} />
            </div>
            <div className="field">
              <label htmlFor="battery">Battery health</label>
              <input id="battery" value={values.battery_health} onChange={set("battery_health")} placeholder="89%" />
            </div>
            <div className="field">
              <label htmlFor="sim">SIM</label>
              <input id="sim" list="sim-options" value={values.sim_type} onChange={set("sim_type")} />
              <datalist id="sim-options">
                <option value="Physical SIM" />
                <option value="eSIM" />
                <option value="Physical SIM + eSIM" />
                <option value="Dual SIM" />
              </datalist>
            </div>
            <div className="field span-2">
              <label htmlFor="network">Network status</label>
              <input id="network" value={values.network_status} onChange={set("network_status")} />
            </div>
            <div className="field span-2">
              <label htmlFor="description">Description</label>
              <textarea id="description" rows="4" value={values.description} onChange={set("description")} />
            </div>
          </div>
        </fieldset>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
          </button>
          <Link to="/admin/products" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
