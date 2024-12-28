import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./appwrite/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Signup from "./appwrite/Signup";
import RegisteredUsersData from "./pages/RegisteredUsersData";
import ProtectedRoute from "./ProtectedRoute";
import './index.css';
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Services from "./pages/Services";
import FinalData from "./pages/FinalData";

const App = () => {
    const [role, setRole] = useState(localStorage.getItem("role")); // Initialize from localStorage
    const [registrationNumber, setRegistrationNumber] = useState(localStorage.getItem("registrationNumber")); // Initialize from localStorage

    useEffect(() => {
        const updateRole = () => setRole(localStorage.getItem("role"));
        const updateRegNumber = () => setRegistrationNumber(localStorage.getItem("registrationNumber"));

        window.addEventListener("storage", updateRole);
        window.addEventListener("storage", updateRegNumber);

        return () => {
            window.removeEventListener("storage", updateRole);
            window.removeEventListener("storage", updateRegNumber);
        };
    }, []);

    const handleLogin = (userRole, regNumber = null) => {
        setRole(userRole);
        localStorage.setItem("role", userRole);

        if (regNumber) {
            setRegistrationNumber(regNumber);
            localStorage.setItem("registrationNumber", regNumber);
        }
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/finalData" element={<FinalData />} />
            
            {/* Login Route */}
            <Route path="/" element={<Login asLogin={handleLogin} />} />
            <Route path="/login" element={<Login asLogin={handleLogin} />} />

            {/* Protected Routes */}
            <Route
                path="/admin-dashboard"
                element={
                    <ProtectedRoute role={role} allowedRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user-dashboard"
                element={
                    <ProtectedRoute role={role} allowedRole="user">
                        <UserDashboard registrationNumber={registrationNumber} />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/registered-users-data"
                element={
                    <ProtectedRoute role={role} allowedRole="admin">
                        <RegisteredUsersData />
                    </ProtectedRoute>
                }
            />

            {/* Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default App;
