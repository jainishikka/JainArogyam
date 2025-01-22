import { useState } from "react";
import { Databases, Query, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const BookAppoEntry = () => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate to programmatically navigate

  // Appwrite client setup
  const client = new Client()
    .setEndpoint(envt_imports.appwriteUrl)
    .setProject(envt_imports.appwriteProjectId);
  const databases = new Databases(client);

  // Handle form submission for booking the appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault(); // prevent default form submit action
    setLoading(true);
    setError(""); // Reset previous errors

    try {
      const trimmedRegistrationNumber = registrationNumber.trim();

      if (!trimmedRegistrationNumber) {
        setError("Registration Number is required.");
        return;
      }

      // Query to find the user with the given registration number
      const response = await databases.listDocuments(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        [Query.equal("RegistrationNumber", registrationNumber)]
      );

      // If user found, navigate to the booking details page
      if (response.documents.length > 0) {
        navigate("/appointment-details", {
          state: { registrationNumber: trimmedRegistrationNumber },
        });
      } else {
        setError("No user found with this registration number.");
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      setError("An error occurred while booking the appointment. Please try again.");
    } finally {
      setLoading(false); // stop loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-500">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Book an Appointment
        </h1>

        <form onSubmit={handleBookAppointment} className="space-y-6">
          <div>
            <label
              htmlFor="registrationNumber"
              className="block text-sm font-medium text-gray-700"
            >
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
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default BookAppoEntry;


