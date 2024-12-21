import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, allowedRole, children }) => {
    // Check if user is authenticated and has the correct role
    const isAuthenticated = localStorage.getItem("role"); // If the user is authenticated
    const userRole = localStorage.getItem("role"); // Role stored in localStorage
    if (!isAuthenticated || userRole !== allowedRole) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
