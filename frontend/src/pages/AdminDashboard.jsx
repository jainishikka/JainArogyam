  import { format } from "date-fns";
  import { useState, useEffect } from "react";
  import { Databases, Client, Query } from "appwrite";
  import envt_imports from "../envt_imports/envt_imports";
  import '@fortawesome/fontawesome-free/css/all.min.css';

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
    const [displayedPatients, setDisplayedPatients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ field: null, direction: "asc" });
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

    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        setPatients(response.documents || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setErrorMessage("Failed to fetch records. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const sortPatients = (field) => {
      const direction =
        sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc";
      setSortConfig({ field, direction });
    
      const sortedPatients = [...patients].sort((a, b) => {
        const valA = a[field] || ""; // Handle null/undefined gracefully
        const valB = b[field] || "";
    
        if (typeof valA === "string" && typeof valB === "string") {
          return direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else if (typeof valA === "number" && typeof valB === "number") {
          return direction === "asc" ? valA - valB : valB - valA;
        } else if (valA instanceof Date && valB instanceof Date) {
          return direction === "asc"
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
        }
        return 0; // Default case
      });
    
      setPatients(sortedPatients);
    };
    
    
    

    
    useEffect(() => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      setDisplayedPatients(patients.slice(startIndex, endIndex));
    }, [patients, currentPage, rowsPerPage]);

    useEffect(() => {
      fetchPatients();
    }, []);

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

    const headers = [
      { label: "Registration Number", field: "RegistrationNumber" },
      { label: "Appointment Date", field: "AppointmentDate" },
      { label: "Patient Name", field: "PatientName" },
      { label: "Patient Problem", field: "PatientProblem" },
      { label: "Doctor Attended", field: "DoctorAttended" },
      { label: "Treatment Done", field: "TreatmentDone" },
      { label: "Package Purchased", field: "PackagePurchased" },
      { label: "Remaining Sessions", field: "RemainingSessions" },
      { label: "Payment Received", field: "PaymentReceived" },
      { label: "Payment Mode", field: "PaymentMode" },
      { label: "Remarks", field: "Remarks" },
    ];
    

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
              {/* <thead>
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
        className="px-6 py-2 border border-gray-300 text-left cursor-pointer"
        onClick={() => sortPatients(header)} // Trigger sorting
      >
        {header}
        <span className="ml-2">
          {sortConfig.field === header && (
            sortConfig.direction === "asc" ? (
              <i className="fas fa-arrow-up text-gray-500"></i>
            ) : (
              <i className="fas fa-arrow-down text-gray-500"></i>
            )
          )}
        </span>
      </th>
    ))}
  </tr>
</thead> */}
            <thead>
  <tr className="bg-gray-200">
    {headers.map(({ label, field }) => (
      <th
        key={field}
        className="px-6 py-2 border border-gray-300 text-left cursor-pointer"
        onClick={() => sortPatients(field)}
      >
        {label}
        <span className="ml-2">
          {sortConfig.field === field && (
            sortConfig.direction === "asc" ? (
              <i className="fas fa-arrow-up text-gray-500"></i>
            ) : (
              <i className="fas fa-arrow-down text-gray-500"></i>
            )
          )}
        </span>
      </th>
    ))}
  </tr>
</thead>


<tbody>
  {patients.length > 0 ? (
    patients.map((patient) => (
      <tr key={patient.$id}>
        {[
          { field: "RegistrationNumber", type: "text", minWidth: "200px" },
          {
            field: "AppointmentDate",
            type: "date",
            minWidth: "150px",
            formatValue: (value) =>
              value ? new Date(value).toISOString().slice(0, 10) : "", // Ensure correct date format
          },
          { field: "PatientName", type: "text", minWidth: "250px" },
          { field: "PatientProblem", type: "text", minWidth: "300px" },
          { field: "DoctorAttended", type: "text", minWidth: "200px" },
          { field: "TreatmentDone", type: "text", minWidth: "200px" },
        ].map(({ field, type, minWidth, formatValue }) => (
          <td
            key={`${patient.$id}-${field}`}
            className="px-6 py-2 border"
            style={{ minWidth }}
          >
            <input
              type={type}
              value={
                formatValue ? formatValue(patient[field]) : patient[field] || ""
              }
              onChange={(e) =>
                handleFieldChange(patient.$id, field, e.target.value)
              }
              className="border rounded px-2 py-1 w-full"
            />
          </td>
        ))}
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
        <td className="px-6 py-2 border">
          <input
            type="number"
            value={patient.RemainingSessions || 0}
            onChange={(e) =>
              handleFieldChange(
                patient.$id,
                "RemainingSessions",
                Math.max(0, parseInt(e.target.value, 10) || 0)
              )
            }
            className="border rounded px-2 py-1 w-full"
          />
        </td>
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
        <td className="px-6 py-2 border">
          <input
            type="text"
            value={patient.PaymentMode || ""}
            onChange={(e) =>
              handleFieldChange(patient.$id, "PaymentMode", e.target.value)
            }
            className="border rounded px-2 py-1 w-full"
          />
        </td>
        <td className="px-6 py-2 border">
          <input
            type="text"
            value={patient.Remarks || ""}
            onChange={(e) =>
              handleFieldChange(patient.$id, "Remarks", e.target.value)
            }
            className="border rounded px-2 py-1 w-full"
          />
        </td>
        <td className="px-6 py-2 border text-center">
          <button
            onClick={() => handleFinalizeRecord(patient)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            aria-label={`Finalize record for ${patient.PatientName}`}
          >
            Finalize
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="12" className="text-center py-4">
        No records found
      </td>
    </tr>
  )}
</tbody>


              </table>
            </div>
          )}
    
          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(Math.ceil(patients.length / rowsPerPage)).keys()].map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === pageNum + 1 ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                {pageNum + 1}
              </button>
            ))}
            <button
              disabled={currentPage === Math.ceil(patients.length / rowsPerPage)}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
    }


  export default AdminDashboard;