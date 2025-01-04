import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Databases, Client, Query } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const client = new Client()
    .setEndpoint(envt_imports.appwriteUrl)
    .setProject(envt_imports.appwriteProjectId);

  const databases = new Databases(client);

  const DATABASE_ID = envt_imports.appwriteDatabaseId;
  const COLLECTION_ID = envt_imports.appwriteCollectionId;
  const FINAL_COLLECTION_ID = envt_imports.appwriteFinalDataCollectionId;
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [searchRegNumber, setSearchRegNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivePatients = async (queryConditions = []) => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        ...queryConditions,
        Query.orderDesc("AppointmentDate"),
      ]);
      setPatients(response.documents || []);
    } catch (error) {
      console.error("Error fetching active patients:", error);
      setErrorMessage("Failed to fetch patient records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeRecord = async (patient) => {
    try {
      const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, AppointmentDate, ...dataToMove } = patient;

      const dataToInsert = {
        ...dataToMove,
        AppointmentDates: AppointmentDate || null,
      };

      const existingFinalRecord = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, [
        Query.equal("RegistrationNumber", patient.RegistrationNumber),
      ]);

      if (existingFinalRecord.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          FINAL_COLLECTION_ID,
          existingFinalRecord.documents[0].$id,
          dataToInsert
        );
      } else {
        await databases.createDocument(DATABASE_ID, FINAL_COLLECTION_ID, "unique()", dataToInsert);
      }

      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, $id);
      setPatients((prev) => prev.filter((p) => p.$id !== $id));
      alert("Record successfully finalized.");
    } catch (error) {
      console.error("Error finalizing record:", error);
      alert(`Failed to finalize the record. Error: ${error.message}`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const queryConditions = [];
      if (searchRegNumber) {
        queryConditions.push(Query.equal("RegistrationNumber", searchRegNumber));
      }
      if (searchDateFrom && searchDateTo) {
        const startFrom = new Date(searchDateFrom).toISOString();
        const endTo = new Date(searchDateTo).setHours(23, 59, 59, 999);
        queryConditions.push(Query.between("AppointmentDate", startFrom, new Date(endTo).toISOString()));
      }
      await fetchActivePatients(queryConditions);
    } catch (error) {
      console.error("Error during search:", error);
      setErrorMessage("Search failed. Please check your input and try again.");
    }
  };

  const handleFieldChange = (id, field, value) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.$id === id
          ? {
              ...patient,
              [field]: field === "RemainingSessions" ? parseInt(value, 10) || 0 : value,
            }
          : patient
      )
    );
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const {
        $id,
        $databaseId,
        $collectionId,
        $permissions,
        $createdAt,
        $updatedAt,
        ...dataToUpdate
      } = updatedData;
  
      if ("PackagePurchased" in dataToUpdate) {
        dataToUpdate.PackagePurchased = Boolean(dataToUpdate.PackagePurchased);
      }
      if ("PaymentReceived" in dataToUpdate) {
        dataToUpdate.PaymentReceived = Boolean(dataToUpdate.PaymentReceived);
      }
      if ("RemainingSessions" in dataToUpdate) {
        dataToUpdate.RemainingSessions = Number(dataToUpdate.RemainingSessions) || 0;
      }
  
      const response = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, dataToUpdate);
  
      setPatients((prev) =>
        prev.map((patient) =>
          patient.$id === id ? { ...patient, ...response } : patient
        )
      );
  
      alert("Record updated successfully!");
    } catch (error) {
      console.error("Failed to update record:", error);
      alert(`Failed to update the record. Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchActivePatients();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Dashboard</h1>

        {/* Navigation Buttons */}
        <div className="mb-6 flex justify-between">
          <button
            onClick={() => navigate("/registered-users-data")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            View Registered Users
          </button>
          <button
            onClick={() => navigate("/finalData")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all"
          >
            View Final Data
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="date"
            value={searchDateFrom}
            onChange={(e) => setSearchDateFrom(e.target.value)}
            placeholder="From Date"
            className="border rounded-lg px-4 py-2 w-full"
          />
          <input
            type="date"
            value={searchDateTo}
            onChange={(e) => setSearchDateTo(e.target.value)}
            placeholder="To Date"
            className="border rounded-lg px-4 py-2 w-full"
          />
          <input
            type="text"
            value={searchRegNumber}
            onChange={(e) => setSearchRegNumber(e.target.value)}
            placeholder="Registration Number"
            className="border rounded-lg px-4 py-2 w-full"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
          >
            Search
          </button>
        </form>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 text-center">
            {errorMessage}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
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
                  "Payment Mode",
                  "Remarks",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-2 border border-gray-300 text-left"
                    style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.$id}>
                    {/* Registration Number */}
                    <td className="px-6 py-2 border" style={{ minWidth: '200px' }}>
                      <input
                        type="text"
                        value={patient.RegistrationNumber || ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "RegistrationNumber", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    
                    {/* Appointment Date */}
                    <td className="px-6 py-2 border" style={{ minWidth: '150px' }}>
                      <input
                        type="date"
                        value={patient.AppointmentDate ? format(new Date(patient.AppointmentDate), "yyyy-MM-dd") : ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "AppointmentDate", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    
                    {/* Patient Name */}
                    <td className="px-6 py-2 border" style={{ minWidth: '250px' }}>
                      <input
                        type="text"
                        value={patient.PatientName || ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "PatientName", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                      />
                    </td>
        
                    {/* Patient Problem */}
                    <td className="px-6 py-2 border" style={{ minWidth: '300px' }}>
                      <input
                        type="text"
                        value={patient.PatientProblem || ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "PatientProblem", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                      />
                    </td>
        
                    {/* Doctor Attended */}
                    <td className="px-6 py-2 border" style={{ minWidth: '200px' }}>
                      <input
                        type="text"
                        value={patient.DoctorAttended || ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "DoctorAttended", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                      />
                    </td>
        
                    {/* Treatment Done */}
                    <td className="px-6 py-2 border" style={{ minWidth: '200px' }}>
                      <input
                        type="text"
                        value={patient.TreatmentDone || ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "TreatmentDone", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                      />
                    </td>
        
                    {/* Package Purchased */}
                    <td className="px-6 py-2 border text-center">
                      <input
                        type="checkbox"
                        checked={patient.PackagePurchased || false}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "PackagePurchased", e.target.checked)
                        }
                        className="h-5 w-5"
                      />
                    </td>
        
                    {/* Remaining Sessions */}
                    <td className="px-6 py-2 border">
                      <input
                        type="number"
                        value={patient.RemainingSessions || 0}
                        onChange={(e) => {
                          // Ensure value is not negative
                          const newValue = Math.max(0, e.target.value); // Prevent negative values
                          handleFieldChange(patient.$id, "RemainingSessions", newValue);
                        }}
                        className="border rounded px-2 py-1 w-full"
                        min="0" // Prevent negative numbers in the input field
                        step="1" // Ensure it's an integer
                      />
                    </td>
        
                    {/* Payment Received */}
                    <td className="px-6 py-2 border text-center">
                      <input
                        type="checkbox"
                        checked={patient.PaymentReceived || false}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "PaymentReceived", e.target.checked)
                        }
                        className="h-5 w-5"
                      />
                    </td>
        
                    {/* Payment Mode */}
                    <td className="px-6 py-2 border">
                      <input
                        type="text"
                        value={patient.PaymentMode || ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "PaymentMode", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                      />
                    </td>
        
                    {/* Remarks */}
                    <td className="px-6 py-2 border">
                      <input
                        type="text"
                        value={patient.Remarks || ""}
                        onChange={(e) =>
                          handleFieldChange(patient.$id, "Remarks", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                      />
                    </td>
        
                    {/* Actions */}
                    <td className="px-6 py-2 border text-center">
                      <button
                        onClick={() => handleFinalizeRecord(patient)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Finalize
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center py-4">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;






import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Databases, Client, Query } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';


const AdminDashboard = () => {
  const client = new Client()
    .setEndpoint(envt_imports.appwriteUrl)
    .setProject(envt_imports.appwriteProjectId);

  const databases = new Databases(client);

  const DATABASE_ID = envt_imports.appwriteDatabaseId;
  const COLLECTION_ID = envt_imports.appwriteCollectionId;
  const FINAL_COLLECTION_ID = envt_imports.appwriteFinalDataCollectionId;
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [searchRegNumber, setSearchRegNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  

  const fetchActivePatients = async (queryConditions = []) => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        ...queryConditions,
        Query.orderDesc("AppointmentDate"),
      ]);
      setPatients(response.documents || []);
    } catch (error) {
      console.error("Error fetching active patients:", error);
      setErrorMessage("Failed to fetch patient records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedPatients = [...patients].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setPatients(sortedPatients);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  useEffect(() => {
    fetchActivePatients();
  }, []);

  const currentPatients = patients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Dashboard</h1>

        <div className="w-full overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                {[
                  "RegistrationNumber",
                  "AppointmentDate",
                  "PatientName",
                  "PatientProblem",
                  "DoctorAttended",
                  "TreatmentDone",
                  "PackagePurchased",
                  "RemainingSessions",
                  "PaymentReceived",
                  "PaymentMode",
                  "Remarks",
                ].map((header) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header)}
                    className="px-6 py-2 border border-gray-300 text-left cursor-pointer flex items-center gap-2"
                  >
                    {header.replace(/([A-Z])/g, " $1").trim()}
                    {getSortIcon(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPatients.length > 0 ? (
                currentPatients.map((patient) => (
                  <tr key={patient.$id}>
                    <td className="px-6 py-2 border">{patient.RegistrationNumber}</td>
                    <td className="px-6 py-2 border">{patient.AppointmentDate}</td>
                    <td className="px-6 py-2 border">{patient.PatientName}</td>
                    <td className="px-6 py-2 border">{patient.PatientProblem}</td>
                    <td className="px-6 py-2 border">{patient.DoctorAttended}</td>
                    <td className="px-6 py-2 border">{patient.TreatmentDone}</td>
                    <td className="px-6 py-2 border">{patient.PackagePurchased ? "Yes" : "No"}</td>
                    <td className="px-6 py-2 border">{patient.RemainingSessions}</td>
                    <td className="px-6 py-2 border">{patient.PaymentReceived ? "Yes" : "No"}</td>
                    <td className="px-6 py-2 border">{patient.PaymentMode}</td>
                    <td className="px-6 py-2 border">{patient.Remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-4">
                    No records found
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

export default AdminDashboard;
















import { useState, useEffect } from "react";
import { Databases, Query, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { Link } from "react-router-dom";

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fetchFinalizedPatients = async () => {
    try {
      setIsLoading(true);

      const queries = [];
      if (startDate && endDate) {
        const { startOfDay: startFrom } = getStartAndEndOfDay(startDate);
        const { endOfDay: endTo } = getStartAndEndOfDay(endDate);
        queries.push(Query.between("AppointmentDates", startFrom, endTo));
      }
      if (registrationSearch) {
        queries.push(Query.equal("RegistrationNumber", registrationSearch));
      }
      queries.push(Query.orderDesc("AppointmentDates"));

      const response = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, queries);
      setFinalizedPatients(response.documents);
    } catch (error) {
      console.error("Error fetching finalized patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinalizedPatients();
  }, []);

  const getStartAndEndOfDay = (dateString) => {
    const date = new Date(dateString);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    return { startOfDay, endOfDay };
  };

  const downloadData = () => {
    const csvHeaders = [
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
    ];
  
    // Map data to ensure it aligns correctly with headers
    const csvContent = [
      csvHeaders.join(","), // Join headers
      ...finalizedPatients.map((patient) => {
        const row = [
          patient.RegistrationNumber || "", // Registration Number
          patient.AppointmentDates
            ? new Date(patient.AppointmentDates).toLocaleDateString() // Appointment Date
            : "N/A",
          patient.PatientName || "", // Patient Name
          patient.PatientProblem || "", // Patient Problem
          patient.DoctorAttended || "", // Doctor Attended
          patient.TreatmentDone || "", // Treatment Done
          patient.PackagePurchased || "", // Package Purchased
          patient.RemainingSessions || "", // Remaining Sessions
          patient.PaymentReceived || "", // Payment Received
          patient.Remarks || "", // Remarks
        ];
        return row.map((value) => `"${value}"`).join(","); // Wrap each value in quotes to handle commas
      }),
    ].join("\n");
  
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finalized_patients_data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedPatients = [...finalizedPatients].sort((a, b) => {
      if (direction === "asc") {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
    setFinalizedPatients(sortedPatients);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "⇅";
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-4xl font-bold text-blue-800 text-center mb-8">
          Finalized Patients Data
        </h1>

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
            <label htmlFor="registrationSearch" className="text-sm font-semibold mb-2">
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
            onClick={fetchFinalizedPatients}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
          >
            Search
          </button>
        </div>

        <button
          onClick={downloadData}
          className="bg-green-500 text-white px-6 py-2 mb-8 rounded-lg hover:bg-green-600 transition-all"
        >
          Download Data
        </button>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-indigo-300 h-16 w-16"></div>
          </div>
        ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-md">
          <thead>
            <tr className="bg-indigo-100 text-gray-700">
              {[
                { key: "RegistrationNumber", label: "Registration Number" },
                { key: "AppointmentDates", label: "Appointment Date" },
                { key: "PatientName", label: "Patient Name" },
                { key: "PatientProblem", label: "Patient Problem" },
                { key: "DoctorAttended", label: "Doctor Attended" },
                { key: "TreatmentDone", label: "Treatment Done" },
                { key: "PackagePurchased", label: "Package Purchased" },
                { key: "RemainingSessions", label: "Remaining Sessions" },
                { key: "PaymentReceived", label: "Payment Received" },
                { key: "Remarks", label: "Remarks" },
              ].map((column) => (
                <th
                  key={column.key}
                  className="border border-gray-300 px-6 py-3 text-left text-sm font-semibold cursor-pointer"
                  onClick={() => sortData(column.key)}
                >
                  {column.label} <span>{getSortIcon(column.key)}</span>
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
        )}
      </div>
    </div>
  );
};

export default FinalData;
