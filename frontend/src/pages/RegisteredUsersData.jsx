import { useEffect, useState } from "react";
import { Databases, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const RegisteredUsersData = () => {
  const client = new Client()
    .setEndpoint(envt_imports.appwriteUrl)
    .setProject(envt_imports.appwriteProjectId);

  const databases = new Databases(client);

  const DATABASE_ID = envt_imports.appwriteDatabaseId;
  const COLLECTION_ID = envt_imports.appwriteCollection2Id;

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);  // Loading state

  const fetchUsers = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      console.log("Response from Appwrite:", response);
      const sortedUsers = response.documents || [];
      
      // Sort users by 'createdAt' in descending order (most recent first)
      sortedUsers.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
      
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to fetch users data. Please try again later.");
    } finally {
      setLoading(false); // End loading after fetch
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        const mobileNumber = user.MobileNumber || "";
        return mobileNumber.toString().toLowerCase().includes(query);
      });
      setFilteredUsers(filtered);
    }
  };

  const handleDateFilter = () => {
    if (!fromDate && !toDate) {
      setFilteredUsers(users);
      return;
    }

    const fromDateTime = fromDate ? new Date(fromDate).getTime() : null;
    const toDateTime = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null; // Include entire 'toDate' day.

    const filtered = users.filter((user) => {
      const createdDateTime = new Date(user.$createdAt).getTime();

      if (fromDateTime && toDateTime) {
        return createdDateTime >= fromDateTime && createdDateTime <= toDateTime;
      }
      if (fromDateTime) {
        return createdDateTime >= fromDateTime;
      }
      if (toDateTime) {
        return createdDateTime <= toDateTime;
      }
      return true;
    });

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-500 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Registered Users Data</h1>

        <button
          onClick={() => navigate("/admin-dashboard")}
          className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Appointment Details
        </button>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        {/* Date Filters */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full transition"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Mobile Number..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-4">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-blue-500 text-3xl"
            />
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border border-gray-300 px-4 py-2">Registration Number</th>
                <th className="border border-gray-300 px-4 py-2">First Name</th>
                <th className="border border-gray-300 px-4 py-2">Last Name</th>
                <th className="border border-gray-300 px-4 py-2">Mobile Number</th>
                <th className="border border-gray-300 px-4 py-2">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.$id} className="hover:bg-gray-100 transition">
                    <td className="border border-gray-300 px-4 py-2">{user.RegistrationNumber}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.FirstName || "N/A"}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.LastName || "N/A"}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.MobileNumber || "N/A"}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.$createdAt ? new Date(user.$createdAt).toLocaleString("en-GB") : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-4">
                    No users found.
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

export default RegisteredUsersData;
