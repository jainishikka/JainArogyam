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
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
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
                    <th key={header} className="px-4 py-2 border border-gray-300">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient.$id}>
                      <td className="px-4 py-2 border">{patient.RegistrationNumber || "N/A"}</td>
                      <td className="px-4 py-2 border">
                        {patient.AppointmentDate
                          ? format(new Date(patient.AppointmentDate), "yyyy-MM-dd")
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={patient.PatientName || ""}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "PatientName", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={patient.PatientProblem || ""}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "PatientProblem", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={patient.DoctorAttended || ""}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "DoctorAttended", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={patient.TreatmentDone || ""}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "TreatmentDone", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="checkbox"
                          checked={patient.PackagePurchased || false}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "PackagePurchased", e.target.checked)
                          }
                          className="h-5 w-5"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={patient.RemainingSessions || 0}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "RemainingSessions", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="checkbox"
                          checked={patient.PaymentReceived || false}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "PaymentReceived", e.target.checked)
                          }
                          className="h-5 w-5"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={patient.PaymentMode || ""}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "PaymentMode", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={patient.Remarks || ""}
                          onChange={(e) =>
                            handleFieldChange(patient.$id, "Remarks", e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleFinalizeRecord(patient)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Finalize
                        </button>
                        <button
                          onClick={() => handleUpdate(patient.$id, patient)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 ml-2"
                        >
                          Update
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
