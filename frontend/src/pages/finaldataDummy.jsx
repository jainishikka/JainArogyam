import { useEffect, useState } from "react";
import { Databases, Client ,Query} from "appwrite";
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  // const fetchUsers = async () => {
  //   try {
  //     const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
  //     const sortedUsers = (response.documents || []).sort(
  //       (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
  //     );
  //     setUsers(sortedUsers);
  //     setFilteredUsers(sortedUsers);
  //   } catch (error) {
  //     setErrorMessage("Failed to fetch users data. Please try again later.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUsers = async () => {
    const limit = 100; // Define a maximum limit
    let offset = 0;
    let allUsers = [];
    let hasMore = true;
  
    try {
      while (hasMore) {
        // Correct query format for Appwrite: no need to manually construct queries with `queries[]`
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.limit(limit),   // Add limit for the number of records per request
          Query.offset(offset), // Add offset to paginate
          // You can add additional filters or sorting here if needed:
          // Example: Query.orderDesc('$createdAt') for sorting by creation date
          Query.orderDesc('$createdAt') // Optional sorting by created date, you can customize this.
        ]);
  
        if (response.documents.length > 0) {
          allUsers = [...allUsers, ...response.documents];
          offset += response.documents.length; // Increment offset for the next batch
        } else {
          hasMore = false; // Stop when no more documents are available
        }
      }
  
      // Sort users by created date after fetching all the records
      const sortedUsers = allUsers.sort(
        (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
      );
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
      setErrorMessage("Failed to fetch users data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const renderPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, index) => (
      <button
        key={index + 1}
        onClick={() => setCurrentPage(index + 1)}
        className={`mx-1 px-3 py-1 rounded-lg ${
          currentPage === index + 1
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-blue-100"
        }`}
      >
        {index + 1}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-500 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Registered Users Data
        </h1>
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Appointment Details
        </button>
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            {errorMessage}
          </div>
        )}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 border rounded-md"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 border rounded-md"
          />
          <button
            onClick={() =>
              setFilteredUsers(
                users.filter((user) => {
                  const createdDate = new Date(user.$createdAt);
                  return (
                    (!fromDate || createdDate >= new Date(fromDate)) &&
                    (!toDate || createdDate <= new Date(toDate))
                  );
                })
              )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Apply Filter
          </button>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value) ||
            setFilteredUsers(
              users.filter((user) =>
                user.MobileNumber?.toLowerCase().includes(searchQuery.toLowerCase())
              )
            )
          }
          className="w-full p-2 border rounded-md mb-4"
          placeholder="Search by Mobile Number..."
        />
        {loading && <FontAwesomeIcon icon={faSpinner} spin />}
        {!loading && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  {[
                    "Registration No",
                    "First Name",
                    "Last Name",
                    "Gender",
                    "Email",
                    "Date Of Birth",
                    "Mobile",
                    "Created Date",
                  ].map((head) => (
                    <th key={head} className="px-4 py-2 border">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((user) => (
                  <tr key={user.$id} className="border-b">
                    <td className="px-4 py-2">{user.RegistrationNumber || "N/A"}</td>
                    <td className="px-4 py-2">{user.FirstName || "N/A"}</td>
                    <td className="px-4 py-2">{user.LastName || "N/A"}</td>
                    <td className="px-4 py-2">{user.Gender || "N/A"}</td>
                    <td className="px-4 py-2">{user.PatientEmail || "N/A"}</td>
                    <td className="px-4 py-2">
                      {user.Date_Of_Birth
                        ? new Date(user.Date_Of_Birth).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2">{user.MobileNumber || "N/A"}</td>
                    <td className="px-4 py-2">
                      {new Date(user.$createdAt).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-between mt-4 items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <div className="flex">{renderPageNumbers()}</div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisteredUsersData;



    // return (
  //   <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-500 p-6">
  //     <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
  //       <h1 className="text-3xl font-bold text-gray-800 mb-6">
  //         Registered Users Data
  //       </h1>
  //       <button
  //         onClick={() => navigate("/admin-dashboard")}
  //         className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
  //       >
  //         Appointment Details
  //       </button>
  //       <button
  //         onClick={downloadData}
  //         className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
  //       >
  //         Download Data
  //       </button>
  //       {errorMessage && (
  //         <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
  //           {errorMessage}
  //         </div>
  //       )}
  //       <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
  //         <input
  //           type="date"
  //           value={fromDate}
  //           onChange={(e) => setFromDate(e.target.value)}
  //           className="p-2 border rounded-md"
  //         />
  //         <input
  //           type="date"
  //           value={toDate}
  //           onChange={(e) => setToDate(e.target.value)}
  //           className="p-2 border rounded-md"
  //         />
  //         <button
  //           onClick={() =>
  //             setFilteredUsers(
  //               users.filter((user) => {
  //                 const createdDate = new Date(user.$createdAt);
  //                 return (
  //                   (!fromDate || createdDate >= new Date(fromDate)) &&
  //                   (!toDate || createdDate <= new Date(toDate))
  //                 );
  //               })
  //             )
  //           }
  //           className="bg-blue-600 text-white px-4 py-2 rounded-lg"
  //         >
  //           Apply Filter
  //         </button>
  //       </div>
  //       <input
  //         type="text"
  //         value={searchQuery}
  //         onChange={(e) =>
  //           setFilteredUsers(
  //             users.filter((user) =>
  //               user.MobileNumber?.toLowerCase().includes(
  //                 e.target.value.toLowerCase()
  //               )
  //             )
  //           )
  //         }
  //         className="w-full p-2 border rounded-md mb-4"
  //         placeholder="Search by Mobile Number..."
  //       />
  //       {loading && <FontAwesomeIcon icon={faSpinner} spin />}
  //       {!loading && (
  //         <div className="mt-6 overflow-x-auto">
  //           <table className="min-w-full border-collapse">
  //             <thead className="bg-gray-200">
  //               <tr>
  //                 {[
  //                   { label: "Registration No", key: "RegistrationNumber" },
  //                   { label: "First Name", key: "FirstName" },
  //                   { label: "Last Name", key: "LastName" },
  //                   { label: "Gender", key: "Gender" },
  //                   { label: "Email", key: "PatientEmail" },
  //                   { label: "Date Of Birth", key: "Date_Of_Birth" },
  //                   { label: "Mobile", key: "MobileNumber" },
  //                   { label: "Created Date", key: "$createdAt" },
  //                 ].map((column) => (
  //                   <th
  //                     key={column.key}
  //                     className="px-4 py-2 border cursor-pointer"
  //                     onClick={() => sortData(column.key)}
  //                   >
  //                     {column.label} {getSortIcon(column.key)}
  //                   </th>
  //                 ))}
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {filteredUsers.slice(0, itemsPerPage).map((user) => (
  //                 <tr key={user.$id} className="border-b">
  //                   <td className="px-4 py-2">{user.RegistrationNumber || "N/A"}</td>
  //                   <td className="px-4 py-2">{user.FirstName || "N/A"}</td>
  //                   <td className="px-4 py-2">{user.LastName || "N/A"}</td>
  //                   <td className="px-4 py-2">{user.Gender || "N/A"}</td>
  //                   <td className="px-4 py-2">{user.PatientEmail || "N/A"}</td>
  //                   <td className="px-4 py-2">
  //                     {user.Date_Of_Birth
  //                       ? new Date(user.Date_Of_Birth).toLocaleDateString()
  //                       : "N/A"}
  //                   </td>
  //                   <td className="px-4 py-2">{user.MobileNumber || "N/A"}</td>
  //                   <td className="px-4 py-2">
  //                     {new Date(user.$createdAt).toLocaleString("en-GB")}
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );