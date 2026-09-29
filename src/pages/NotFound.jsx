import { Link } from "react-router-dom";
import usePageMeta from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta({ title: "Page not found" });
  return (
    <div className="wrap page narrow">
      <h1>Page not found</h1>
      <p>The page you opened does not exist or has moved.</p>
      <Link to="/" className="btn btn-dark">
        Go to home
      </Link>
    </div>
  );
}
