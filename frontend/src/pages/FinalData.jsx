import { useState, useEffect } from "react";
import { Databases, Query, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { Link } from "react-router-dom"; // Import Link for routing

const FinalData = () => {
  const client = new Client()
    .setEndpoint(envt_imports.appwriteUrl)
    .setProject(envt_imports.appwriteProjectId);
  const databases = new Databases(client);

  const DATABASE_ID = envt_imports.appwriteDatabaseId;
  const FINAL_COLLECTION_ID = envt_imports.appwriteFinalDataCollectionId;

  const [finalizedPatients, setFinalizedPatients] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch finalized patients with optional filters
  const fetchFinalizedPatients = async () => {
    try {
      setIsLoading(true); // Set loading state to true when fetching data

      const queries = [];

      // Apply date range filter
      if (startDate && endDate) {
        const { startOfDay: startFrom } = getStartAndEndOfDay(startDate);
        const { endOfDay: endTo } = getStartAndEndOfDay(endDate);
        queries.push(Query.between("AppointmentDates", startFrom, endTo));
      }

      // Apply registration number filter
      if (registrationSearch) {
        queries.push(Query.equal("RegistrationNumber", registrationSearch));
      }

      // Order by AppointmentDates in descending order to get the most recent records first
      queries.push(Query.orderDesc("AppointmentDates"));

      const response = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, queries);
      setFinalizedPatients(response.documents);
    } catch (error) {
      console.error("Error fetching finalized patients:", error);
    } finally {
      setIsLoading(false); // Set loading state to false after the request completes
    }
  };

  useEffect(() => {
    fetchFinalizedPatients(); // Fetch data when the component is mounted
  }, []);

  const handleSearch = () => {
    fetchFinalizedPatients(); // Re-fetch data when the search is performed
  };

  const getStartAndEndOfDay = (dateString) => {
    const date = new Date(dateString);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    return { startOfDay, endOfDay };
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-4xl font-bold text-blue-800 text-center mb-8">
          Finalized Patients Data
        </h1>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-6 mb-8">
          <Link
            to="/admin-dashboard"
            className="bg-blue-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Appointment Details
          </Link>
          <Link
            to="/registered-users-data"
            className="bg-indigo-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            View Registered Users
          </Link>
        </div>

        {/* Search Form */}
        <div className="flex flex-wrap gap-6 mb-8 items-center justify-center">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm font-semibold mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-sm font-semibold mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="registrationSearch"
              className="text-sm font-semibold mb-2"
            >
              Registration Number
            </label>
            <input
              type="text"
              id="registrationSearch"
              value={registrationSearch}
              onChange={(e) => setRegistrationSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
          >
            Search
          </button>
        </div>

        {/* Spinner */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-indigo-300 h-16 w-16"></div>
          </div>
        )}

        {/* Finalized Patients Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-md">
            <thead>
              <tr className="bg-indigo-100 text-gray-700">
                {[
                  "Registration Number",
                  "Appointment Date",
                  "Patient Name",
                  "Patient Problem",
                  "Doctor Attended",
                  "Treatment Done",
                  "Package Purchased",
                  "Remaining Sessions",
                  "Payment Received",
                  "Remarks",
                ].map((header) => (
                  <th key={header} className="border border-gray-300 px-6 py-3 text-left text-sm font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finalizedPatients.length > 0 ? (
                finalizedPatients.map((patient) => (
                  <tr key={patient.$id} className="border-b hover:bg-indigo-50">
                    {[
                      "RegistrationNumber",
                      "AppointmentDates",
                      "PatientName",
                      "PatientProblem",
                      "DoctorAttended",
                      "TreatmentDone",
                      "PackagePurchased",
                      "RemainingSessions",
                      "PaymentReceived",
                      "Remarks",
                    ].map((field) => (
                      <td key={field} className="border border-gray-300 px-6 py-3 text-sm">
                        {field === "AppointmentDates"
                          ? patient[field]
                            ? new Date(patient[field]).toLocaleDateString()
                            : "N/A"
                          : patient[field] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-sm text-gray-600">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinalData;
