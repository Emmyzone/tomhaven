import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingState } from "./StateMessage.jsx";

// Blocks /admin unless the visitor is logged in AND listed as an admin.
// The database enforces the same rule, so hiding the page is not the only protection.
export default function RequireAdmin({ children }) {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="wrap">
        <LoadingState label="Checking your login" />
      </div>
    );
  }
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}
