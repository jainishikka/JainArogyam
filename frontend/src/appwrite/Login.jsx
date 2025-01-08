import { useState } from "react";
import { Databases, Query, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Login = ({ asLogin }) => {
  const [password, setPassword] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const client = new Client()
    .setEndpoint(envt_imports.appwriteUrl)
    .setProject(envt_imports.appwriteProjectId);
  const ADMIN_PASSWORD = "password"; 
  const databases = new Databases(client);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isAdminLogin) {
        // Admin Login
        if (password === ADMIN_PASSWORD) {
          asLogin("admin");
          navigate("/admin-dashboard");
        } else {
          setError("Invalid admin password.");
        }
      } else {
        // User Login
        const trimmedRegistrationNumber = registrationNumber.trim();

        if (!trimmedRegistrationNumber) {
          setError("Registration Number is required.");
          return;
        }

        const response = await databases.listDocuments(
          envt_imports.appwriteDatabaseId,
          envt_imports.appwriteCollection2Id,
          [Query.equal("RegistrationNumber", registrationNumber)]
        );

        if (response.documents.length > 0) {
          asLogin("user", trimmedRegistrationNumber);
          navigate("/user-dashboard", { state: { registrationNumber: trimmedRegistrationNumber } });
        } else {
          setError("No user found with this registration number.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-500">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
         <span className="text-blue-500">Book Appointment</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {isAdminLogin ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          )}

          {/* Spinner when loading */}
          {loading && (
            <div className="flex justify-center py-4">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-blue-500 text-3xl"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200 disabled:bg-gray-400 transition"
          >
            {loading ? "  ging In..." : "Book Appointment"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          {/* <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={isAdminLogin}
              onChange={() => setIsAdminLogin(!isAdminLogin)}
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
            />
            <span className="ml-2">Admin Login</span>
          </label> */}
          {/* <Link to="/signup" className="text-sm text-blue-500 hover:underline">
            Don't have an account? Sign Up
          </Link> */}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

Login.propTypes = {
  asLogin: PropTypes.func.isRequired,
};

export default Login;