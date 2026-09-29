import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Price from "../../components/Price.jsx";
import ProductImage from "../../components/ProductImage.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateMessage.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import useProducts from "../../hooks/useProducts";
import { errorMessage } from "../../lib/format";
import { deleteProductImage } from "../../services/imageService";
import { deleteProduct, updateProduct } from "../../services/productService";

const TABS = [
  ["all", "All"],
  ["available", "Available"],
  ["sold", "Sold"],
];

export default function AdminProducts() {
  const toast = useToast();
  const { products, loading, error, reload } = useProducts({ category: null });
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function toggleStatus(product) {
    const markSold = product.status !== "sold";
    setBusyId(product.id);
    try {
      await updateProduct(product.id, { status: markSold ? "sold" : "available" });
      toast.success(markSold ? "Product marked as sold." : "Product marked as available.");
      await reload();
    } catch (err) {
      toast.error(errorMessage(err, "Could not update the product."));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteProduct(toDelete.id);
      await deleteProductImage(toDelete.image_path);
      toast.success("Product deleted successfully.");
      setToDelete(null);
      await reload();
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the product."));
    } finally {
      setDeleting(false);
    }
  }

  const visible = products.filter((p) => tab === "all" || p.status === tab);

  return (
    <div>
      <div className="page-head">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>

      <div className="tabs" role="tablist" aria-label="Filter products">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? "active" : undefined}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <LoadingState label="Loading products" />}
      {error && <ErrorState message="The products could not be loaded." onRetry={reload} />}
      {!loading && !error && visible.length === 0 && (
        <EmptyState title="No products here">
          {tab === "all" ? "Add your first phone to get started." : "Nothing matches this tab yet."}
        </EmptyState>
      )}

      <ul className="admin-list">
        {visible.map((p) => (
          <li key={p.id} className="admin-row">
            <div className="admin-thumb">
              <ProductImage src={p.image_url} alt={p.name} />
            </div>
            <div className="admin-row-info">
              <p className="admin-row-name">{p.name}</p>
              <p className="admin-row-sub">
                <Price value={p.price} currency={p.currency} />
                {p.storage && <span>{p.storage}</span>}
                <span className={`status status-${p.status}`}>
                  {p.status === "sold" ? "Sold" : "Available"}
                </span>
              </p>
            </div>
            <div className="admin-row-actions">
              <Link to={`/admin/products/${p.id}/edit`} className="btn btn-ghost btn-sm">
                Edit
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={busyId === p.id}
                onClick={() => toggleStatus(p)}
              >
                {p.status === "sold" ? "Mark available" : "Mark sold"}
              </button>
              <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => setToDelete(p)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this product?"
        message={toDelete ? `“${toDelete.name}” will be removed from the website. This cannot be undone.` : ""}
        confirmLabel="Delete product"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
