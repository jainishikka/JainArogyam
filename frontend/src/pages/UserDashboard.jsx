import { useState, useEffect } from "react";
import { Databases, Query, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const UserDashboard = ({ registrationNumber }) => {
    const [patientName, setPatientName] = useState("");
    const [patientProblem, setPatientProblem] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const client = new Client().setEndpoint(envt_imports.appwriteUrl).setProject(envt_imports.appwriteProjectId);
    const databases = new Databases(client);
    const DATABASE_ID = envt_imports.appwriteDatabaseId;
    const COLLECTION_ID = envt_imports.appwriteCollectionId; 

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    envt_imports.appwriteCollection2Id, 
                    [Query.equal("RegistrationNumber", registrationNumber)]
                );

                if (response.documents.length > 0) {
                    const patient = response.documents[0];
                    setPatientName(patient.PatientName);
                } else {
                    setErrorMessage("Patient data not found.");
                }
            } catch (error) {
                console.error(error);
                setErrorMessage("Error fetching patient data.");
            }
        };

        fetchPatientData();
    }, [registrationNumber]);

    const handleSubmitDetails = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const newDetails = {
                PatientProblem: patientProblem,
                RegistrationNumber: registrationNumber,
                PatientName: patientName,
                AppointmentDate: new Date().toISOString(),
                Remarks: "",
                TreatmentDone: "",
                PaymentReceived: false,
                PackagePurchased: false,
                RemainingSessions: 0,
            };

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal("RegistrationNumber", registrationNumber)]
            );

            if (response.documents.length > 0) {
                // If record exists, update it
                const documentId = response.documents[0].$id;
                await databases.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, newDetails);
            } else {
                // If no record, create a new one
                await databases.createDocument(DATABASE_ID, COLLECTION_ID, "unique()", newDetails);
            }

            setSuccessMessage("Details updated successfully!");
            setPatientProblem("");
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to update details. Please try again.");
        }
    };

    const handleRedirectToLogin = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Hello, {patientName || "User"}!</h1>
                <p className="text-gray-600 mb-6">Welcome to your dashboard. Please provide your details below.</p>

                {/* Success and Error Messages */}
                {successMessage && (
                    <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4 text-sm">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 text-sm">
                        {errorMessage}
                    </div>
                )}

                {/* Form for User Details */}
                <form onSubmit={handleSubmitDetails}>
                    <div className="mb-4">
                        <label
                            htmlFor="patientProblem"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Patient Problem:
                        </label>
                        <textarea
                            id="patientProblem"
                            value={patientProblem}
                            onChange={(e) => setPatientProblem(e.target.value)}
                            placeholder="Describe the problem"
                            // required
                            className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        Submit Details
                    </button>
                </form>

                {/* Success Message with Redirect Button */}
                {successMessage && (
                    <div className="mt-6 bg-green-200 p-4 rounded-md text-center">
                        <button
                            onClick={handleRedirectToLogin}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                            Go to Login Page
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

UserDashboard.propTypes = {
    registrationNumber: PropTypes.string.isRequired,
};

export default UserDashboard;
