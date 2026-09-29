import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import { ErrorState, LoadingState } from "../../components/StateMessage.jsx";

export default function Dashboard() {
  const { products, loading, error, reload } = useProducts({ category: null });

  if (loading) return <LoadingState label="Loading dashboard" />;
  if (error) {
    return <ErrorState message="The dashboard could not be loaded." onRetry={reload} />;
  }

  const available = products.filter((p) => p.status === "available").length;
  const sold = products.filter((p) => p.status === "sold").length;

  return (
    <div>
      <h1>Dashboard</h1>
      <dl className="stats">
        <div>
          <dt>Total products</dt>
          <dd>{products.length}</dd>
        </div>
        <div>
          <dt>Available</dt>
          <dd>{available}</dd>
        </div>
        <div>
          <dt>Sold</dt>
          <dd>{sold}</dd>
        </div>
      </dl>
      <div className="btn-row">
        <Link to="/admin/products/new" className="btn btn-primary">
          Add a phone
        </Link>
        <Link to="/admin/products" className="btn btn-ghost">
          Manage products
        </Link>
        <Link to="/" className="btn btn-ghost">
          View website
        </Link>
      </div>
    </div>
  );
}
