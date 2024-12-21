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

  const fetchActivePatients = async () => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      setPatients(response.documents || []);
    } catch (error) {
      console.error("Error fetching active patients:", error);
      setErrorMessage("Failed to fetch patient records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleFinalizeRecord = async (patient) => {
  //   try {
  //     // Move record to FinalDataCollection
  //     const { $id, ...dataToMove } = patient;
  //     const existingFinalRecord = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, [
  //       Query.equal("RegistrationNumber", patient.RegistrationNumber),
  //     ]);

  //     if (existingFinalRecord.documents.length > 0) {
  //       // Update existing record in FinalDataCollection
  //       await databases.updateDocument(
  //         DATABASE_ID,
  //         FINAL_COLLECTION_ID,
  //         existingFinalRecord.documents[0].$id,
  //         dataToMove
  //       );
  //     } else {
  //       // Create new record in FinalDataCollection
  //       await databases.createDocument(DATABASE_ID, FINAL_COLLECTION_ID, "unique()", dataToMove);
  //     }

  //     // Remove record from ActiveDataCollection
  //     await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, $id);

  //     // Update UI
  //     setPatients((prev) => prev.filter((p) => p.$id !== $id));
  //     alert("Record successfully finalized.");
  //   } catch (error) {
  //     console.error("Error finalizing record:", error);
  //     alert("Failed to finalize the record. Please try again.");
  //   }
  // };

  // const handleFinalizeRecord = async (patient) => {
  //   try {
  //     const { $id, ...dataToMove } = patient;
  
  //     // Optional: Remove fields not part of the schema
  //     const allowedFields = [
  //       "RegistrationNumber",
  //       "AppointmentDate",
  //       "PatientName",
  //       "PatientProblem",
  //       "DoctorAttended",
  //       "TreatmentDone",
  //       "PackagePurchased",
  //       "RemainingSessions",
  //       "PaymentReceived",
  //       "PaymentMode",
  //       "Remarks",
  //     ];
  //     const sanitizedData = Object.keys(dataToMove)
  //       .filter((key) => allowedFields.includes(key))
  //       .reduce((obj, key) => {
  //         obj[key] = dataToMove[key];
  //         return obj;
  //       }, {});
  
  //     // Check for existing record in FinalDataCollection
  //     const existingFinalRecord = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, [
  //       Query.equal("RegistrationNumber", patient.RegistrationNumber),
  //     ]);
  
  //     if (existingFinalRecord.documents.length > 0) {
  //       // Update existing record in FinalDataCollection
  //       await databases.updateDocument(
  //         DATABASE_ID,
  //         FINAL_COLLECTION_ID,
  //         existingFinalRecord.documents[0].$id,
  //         sanitizedData
  //       );
  //     } else {
  //       // Create new record in FinalDataCollection
  //       await databases.createDocument(DATABASE_ID, FINAL_COLLECTION_ID, "unique()", sanitizedData);
  //     }
  
  //     // Remove record from ActiveDataCollection
  //     await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, $id);
  
  //     // Update UI
  //     setPatients((prev) => prev.filter((p) => p.$id !== $id));
  //     alert("Record successfully finalized.");
  //   } catch (error) {
  //     console.error("Error finalizing record:", error);
  //     alert("Failed to finalize the record. Please try again.");
  //   }
  // };
  
  // const handleFinalizeRecord = async (patient) => {
  //   try {
  //     const { $id, AppointmentDate, ...dataToMove } = patient;
  
  //     // Map the AppointmentDate field to AppointmentDates for FinalDataCollection
  //     const dataToInsert = {
  //       ...dataToMove,
  //       AppointmentDates: AppointmentDate || null, // Ensure compatibility
  //     };
  
  //     // Check for existing record in FinalDataCollection
  //     const existingFinalRecord = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, [
  //       Query.equal("RegistrationNumber", patient.RegistrationNumber),
  //     ]);
  
  //     if (existingFinalRecord.documents.length > 0) {
  //       // Update existing record in FinalDataCollection
  //       await databases.updateDocument(
  //         DATABASE_ID,
  //         FINAL_COLLECTION_ID,
  //         existingFinalRecord.documents[0].$id,
  //         dataToInsert
  //       );
  //     } else {
  //       // Create new record in FinalDataCollection
  //       await databases.createDocument(DATABASE_ID, FINAL_COLLECTION_ID, "unique()", dataToInsert);
  //     }
  
  //     // Remove record from ActiveDataCollection
  //     await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, $id);
  
  //     // Update UI
  //     setPatients((prev) => prev.filter((p) => p.$id !== $id));
  //     alert("Record successfully finalized.");
  //   } catch (error) {
  //     console.error("Error finalizing record:", error);
  //     alert("Failed to finalize the record. Please try again.");
  //   }
  // };
  
  const handleFinalizeRecord = async (patient) => {
    try {
      // Remove Appwrite system fields and map AppointmentDate to AppointmentDates
      const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, AppointmentDate, ...dataToMove } = patient;
  
      const dataToInsert = {
        ...dataToMove,
        AppointmentDates: AppointmentDate || null, // Map correctly
      };
  
      // Check for an existing record in FinalDataCollection
      const existingFinalRecord = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, [
        Query.equal("RegistrationNumber", patient.RegistrationNumber),
      ]);
  
      if (existingFinalRecord.documents.length > 0) {
        // Update the existing record
        await databases.updateDocument(
          DATABASE_ID,
          FINAL_COLLECTION_ID,
          existingFinalRecord.documents[0].$id,
          dataToInsert
        );
      } else {
        // Create a new record
        await databases.createDocument(DATABASE_ID, FINAL_COLLECTION_ID, "unique()", dataToInsert);
      }
  
      // Remove the record from ActiveDataCollection
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, $id);
  
      // Update UI
      setPatients((prev) => prev.filter((p) => p.$id !== $id));
      alert("Record successfully finalized.");
    } catch (error) {
      console.error("Error finalizing record:", error);
      alert(`Failed to finalize the record. Error: ${error.message}`);
    }
  };
  
  const getStartAndEndOfDay = (dateString) => {
    const date = new Date(dateString);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    return { startOfDay, endOfDay };
  };

  const fetchPatients = async (queryConditions = []) => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queryConditions);
      setPatients(response.documents || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
      setErrorMessage("Failed to fetch patient records. Please try again later.");
    } finally {
      setIsLoading(false);
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
        const { startOfDay: startFrom } = getStartAndEndOfDay(searchDateFrom);
        const { endOfDay: endTo } = getStartAndEndOfDay(searchDateTo);
        queryConditions.push(Query.between("AppointmentDate", startFrom, endTo));
      }
      await fetchPatients(queryConditions);
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
              [field]:
                field === "RemainingSessions"
                  ? parseInt(value, 10) || 0
                  : field === "PaymentReceived" || field === "PackagePurchased"
                  ? value === "true" || value === true
                  : value,
            }
          : patient
      )
    );
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const { $id, $createdAt, $updatedAt, $databaseId, $collectionId, ...dataToUpdate } = updatedData;
      if (dataToUpdate.RemainingSessions === "") delete dataToUpdate.RemainingSessions;
      const response = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, dataToUpdate);
      setPatients((prev) =>
        prev.map((patient) =>
          patient.$id === id ? { ...patient, ...response } : patient
        )
      );
      alert("Record updated successfully!");
    } catch (error) {
      console.error("Failed to update record:", error);
      alert("There was an issue updating the record. Please try again later.");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <button
          onClick={() => navigate("/registered-users-data")}
          className="mb-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Registered Users Data
        </button>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex space-x-4 items-center">
            {/* Date Filters */}
            <label className="text-sm text-gray-600">
              From:
              <input
                type="date"
                value={searchDateFrom}
                onChange={(e) => setSearchDateFrom(e.target.value)}
                className="ml-2 border rounded-md px-3 py-1 text-gray-700"
              />
            </label>
            <label className="text-sm text-gray-600">
              To:
              <input
                type="date"
                value={searchDateTo}
                onChange={(e) => setSearchDateTo(e.target.value)}
                className="ml-2 border rounded-md px-3 py-1 text-gray-700"
              />
            </label>
            {/* Reg Number */}
            <label className="text-sm text-gray-600">
              Reg. Number:
              <input
                type="text"
                value={searchRegNumber}
                onChange={(e) => setSearchRegNumber(e.target.value)}
                className="ml-2 border rounded-md px-3 py-1 text-gray-700"
              />
            </label>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-6">
            <span>Loading...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
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
                    <th key={header} className="border border-gray-300 px-4 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient.$id}>
                      {/* Dynamically Render Each Cell */}
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
                      ].map((field) => (
                        <td key={field} className="border border-gray-300 px-4 py-2">
                          {field === "AppointmentDate" ? (
                            patient.AppointmentDate
                              ? format(new Date(patient.AppointmentDate), "yyyy-MM-dd")
                              : "N/A"
                          ) : field === "RemainingSessions" ? (
                            <input
                              type="number"
                              value={patient[field] || 0}
                              onChange={(e) => handleFieldChange(patient.$id, field, e.target.value)}
                              className="w-full border rounded px-2 py-1"
                            />
                          ) : field === "PaymentReceived" || field === "PackagePurchased" ? (
                            <select
                              value={patient[field] ? "true" : "false"}
                              onChange={(e) =>
                                handleFieldChange(patient.$id, field, e.target.value === "true")
                              }
                              className="w-full border rounded px-2 py-1"
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={patient[field] || ""}
                              onChange={(e) => handleFieldChange(patient.$id, field, e.target.value)}
                              className="w-full border rounded px-2 py-1"
                            />
                          )}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => handleUpdate(patient.$id, patient)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleFinalizeRecord(patient)}
                          className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Finalize
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center py-4">
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

export default AdminDashboard;


import { useState, useEffect } from "react";
import { Databases, Query, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";

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

  // Fetch finalized patients with optional filters
  const fetchFinalizedPatients = async () => {
    try {
      const queries = [];
      if (startDate && endDate) {
        const { startOfDay: startFrom } = getStartAndEndOfDay(startDate);
        const { endOfDay: endTo } = getStartAndEndOfDay(endDate);
        queries.push(Query.between("AppointmentDates", startFrom, endTo));
      }
      if (registrationSearch) {
        queries.push(Query.equal("RegistrationNumber", registrationSearch));
      }

      const response = await databases.listDocuments(DATABASE_ID, FINAL_COLLECTION_ID, queries);
      setFinalizedPatients(response.documents);
    } catch (error) {
      console.error("Error fetching finalized patients:", error);
    }
  };

  useEffect(() => {
    fetchFinalizedPatients();
  }, []);

  const handleSearch = () => {
    fetchFinalizedPatients();
  };

  const getStartAndEndOfDay = (dateString) => {
    const date = new Date(dateString);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    return { startOfDay, endOfDay };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Finalized Patients Data
      </h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-center">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-sm font-semibold mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-sm font-semibold mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="registrationSearch"
            className="text-sm font-semibold mb-1"
          >
            Registration Number
          </label>
          <input
            type="text"
            id="registrationSearch"
            value={registrationSearch}
            onChange={(e) => setRegistrationSearch(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
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
                <th key={header} className="border border-gray-300 px-4 py-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {finalizedPatients.length > 0 ? (
              finalizedPatients.map((patient) => (
                <tr key={patient.$id}>
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
                    <td key={field} className="border border-gray-300 px-4 py-2">
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
                <td colSpan="10" className="text-center py-4">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinalData;


import { useState, useEffect } from "react";
import { Account, Client, Databases, Query } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";

const client = new Client()
  .setEndpoint(envt_imports.appwriteUrl)
  .setProject(envt_imports.appwriteProjectId);

const account = new Account(client);
const databases = new Databases(client);

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "", registrationNumber: null });

  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const user = await account.get();
        console.log("User is logged in", user);
      } catch (error) {
        console.log("No logged-in user", error);
      }
    };
    checkLoggedInUser();
  }, []);

  const generateRegistrationNumber = () => {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REG-${timestamp}-${randomString}`;
  };

  // const handleSignup = async (e) => {
  //   e.preventDefault();

  //   // Prevent multiple submissions
  //   if (loading) return;

  //   setLoading(true);
  //   setAlert({ type: "", message: "", registrationNumber: null });

  //   // Validation
  //   if (!firstName || !lastName || !email || !mobile || !gender || !dob) {
  //     setAlert({ type: "error", message: "All fields are required." });
  //     setLoading(false);
  //     return;
  //   }

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(email)) {
  //     setAlert({ type: "error", message: "Please enter a valid email address." });
  //     setLoading(false);
  //     return;
  //   }

  //   if (mobile.length !== 10 || isNaN(mobile)) {
  //     setAlert({ type: "error", message: "Please enter a valid 10-digit mobile number." });
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     // Format Date of Birth to ISO 8601 format (required by Appwrite)
  //     const formattedDob = new Date(dob).toISOString();

  //     // Combine FirstName and LastName
  //     const patientName = `${firstName} ${lastName}`.trim();

  //     // Check for duplicate fields in the database
  //     const existingUsersResponse = await databases.listDocuments(
  //       envt_imports.appwriteDatabaseId,
  //       envt_imports.appwriteCollection2Id,
  //       Query.or([
  //         Query.equal("FirstName", firstName),
  //         Query.equal("LastName", lastName),
  //         Query.equal("PatientEmail", email),
  //         Query.equal("MobileNumber", mobile),
  //       ])
  //     );

  //     if (existingUsersResponse.documents.length > 0) {
  //       setAlert({
  //         type: "error",
  //         message: "A user with the same details already exists (Name, Email, or Mobile Number).",
  //       });
  //       setLoading(false);
  //       return;
  //     }

  //     // Create user in Appwrite Authentication system
  //     const createdUser = await account.create("unique()", email, "defaultpassword", patientName);
  //     console.log("User created in Appwrite:", createdUser);

  //     // Create the user document in the Appwrite database
  //     const registrationNumber = generateRegistrationNumber();
  //     await databases.createDocument(
  //       envt_imports.appwriteDatabaseId,
  //       envt_imports.appwriteCollection2Id,
  //       "unique()",
  //       {
  //         FirstName: firstName,
  //         LastName: lastName,
  //         PatientName: patientName, // Save combined name
  //         PatientEmail: email,
  //         MobileNumber: mobile,
  //         Gender: gender,
  //         RegistrationNumber: registrationNumber,
  //         Date_Of_Birth: formattedDob, // Save in ISO 8601 format
  //       }
  //     );

  //     // Store user role and registration number in local storage
  //     localStorage.setItem("role", "user");
  //     localStorage.setItem("registrationNumber", registrationNumber);

  //     // Show success message
  //     setAlert({
  //       type: "success",
  //       message: "Signup successful! Your Registration Number is displayed below.",
  //       registrationNumber,
  //     });

  //     // Reset form fields
  //     setFirstName("");
  //     setLastName("");
  //     setEmail("");
  //     setMobile("");
  //     setGender("");
  //     setDob("");
  //     setSuccess(true);

  //   } catch (error) {
  //     console.error("Signup error:", error);
  //     setAlert({ type: "error", message: "Signup failed. Please try again." });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    // Prevent multiple submissions
    if (loading) return;
  
    setLoading(true);
    setAlert({ type: "", message: "", registrationNumber: null });
  
    // Validation
    if (!firstName || !lastName || !email || !mobile || !gender || !dob) {
      setAlert({ type: "error", message: "All fields are required." });
      setLoading(false);
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlert({ type: "error", message: "Please enter a valid email address." });
      setLoading(false);
      return;
    }
  
    if (mobile.length !== 10 || isNaN(mobile)) {
      setAlert({ type: "error", message: "Please enter a valid 10-digit mobile number." });
      setLoading(false);
      return;
    }
  
    try {
      // Format Date of Birth to ISO 8601 format (required by Appwrite)
      const formattedDob = new Date(dob).toISOString();
  
      // Combine FirstName and LastName
      const patientName = `${firstName} ${lastName}`.trim();
  
      // Query the database for existing entries
      const existingUsersResponse = await databases.listDocuments(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        [
          Query.equal("FirstName", firstName),
          Query.equal("LastName", lastName),
          Query.equal("PatientEmail", email),
          Query.equal("MobileNumber", mobile),
        ]
      );
  
      if (existingUsersResponse.documents.length > 0) {
        setAlert({
          type: "error",
          message: "A user with the same details already exists (Name, Email, or Mobile Number).",
        });
        setLoading(false);
        return;
      }
  
      // Create user in Appwrite Authentication system
      const createdUser = await account.create("unique()", email, "defaultpassword", patientName);
      console.log("User created in Appwrite:", createdUser);
  
      // Create the user document in the Appwrite database
      const registrationNumber = generateRegistrationNumber();
      await databases.createDocument(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        "unique()",
        {
          FirstName: firstName,
          LastName: lastName,
          PatientName: patientName, // Save combined name
          PatientEmail: email,
          MobileNumber: mobile,
          Gender: gender,
          RegistrationNumber: registrationNumber,
          Date_Of_Birth: formattedDob, // Save in ISO 8601 format
        }
      );
  
      // Store user role and registration number in local storage
      localStorage.setItem("role", "user");
      localStorage.setItem("registrationNumber", registrationNumber);
  
      // Show success message
      setAlert({
        type: "success",
        message: "Signup successful! Your Registration Number is displayed below.",
        registrationNumber,
      });
  
      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobile("");
      setGender("");
      setDob("");
      setSuccess(true);
  
    } catch (error) {
      console.error("Signup error:", error);
      setAlert({ type: "error", message: "Signup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRedirectToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Signup</h2>

        {alert.message && (
          <div
            className={`mb-4 text-sm px-4 py-3 rounded ${
              alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {alert.message}
            {alert.type === "success" && (
              <div className="mt-2 text-lg font-semibold">
                Registration Number: <span className="text-blue-700">{alert.registrationNumber}</span>
              </div>
            )}
          </div>
        )}

<form onSubmit={handleSignup}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700"
            />
          </div>
          {/* Remaining Fields */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile:</label>
            <input
              type="tel"
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender:</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth:</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Signing Up..." : "Signup"}
          </button>
        </form>

        {success && (
          <div className="mt-6 text-center">
            <p className="text-green-700 font-medium mb-4">Signup successful! You can now log in.</p>
            <button
              onClick={handleRedirectToLogin}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;


import { useEffect, useState } from "react";
import { Databases, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";



// export default RegisteredUsersData;

// Registered Users Data-
// const RegisteredUsersData = () => {
//   const client = new Client()
//     .setEndpoint(envt_imports.appwriteUrl)
//     .setProject(envt_imports.appwriteProjectId);

//   const databases = new Databases(client);

//   const DATABASE_ID = envt_imports.appwriteDatabaseId;
//   const COLLECTION_ID = envt_imports.appwriteCollection2Id;

//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const fetchUsers = async () => {
//     try {
//       const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
//       console.log("Response from Appwrite:", response);
//       setUsers(response.documents || []);
//       setFilteredUsers(response.documents || []);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       setErrorMessage("Failed to fetch users data. Please try again later.");
//     }
//   };

//   const handleSearch = (event) => {
//     const query = event.target.value.toLowerCase();
//     setSearchQuery(query);

//     if (query.trim() === "") {
//       setFilteredUsers(users);
//     } else {
//       const filtered = users.filter((user) => {
//         const mobileNumber = user.MobileNumber || "";
//         return mobileNumber.toString().toLowerCase().includes(query);
//       });
//       setFilteredUsers(filtered);
//     }
//   };

//   // const handleDateFilter = () => {
//   //   if (!fromDate && !toDate) {
//   //     setFilteredUsers(users);
//   //     return;
//   //   }

//   //   const fromDateTime = fromDate ? new Date(fromDate).getTime() : null;
//   //   const toDateTime = toDate ? new Date(toDate).getTime() : null;

//   //   const filtered = users.filter((user) => {
//   //     const createdDate = new Date(user.$createdAt).getTime();
//   //     if (fromDateTime && toDateTime) {
//   //       return createdDate >= fromDateTime && createdDate <= toDateTime;
//   //     }
//   //     if (fromDateTime) {
//   //       return createdDate >= fromDateTime;
//   //     }
//   //     if (toDateTime) {
//   //       return createdDate <= toDateTime;
//   //     }
//   //     return true;
//   //   });

//   //   setFilteredUsers(filtered);
//   // };

//   // const handleDateFilter = () => {
//   //   if (!fromDate && !toDate) {
//   //     setFilteredUsers(users);
//   //     return;
//   //   }
  
//   //   // Convert input dates to ISO format for accurate comparison
//   //   const fromDateTime = fromDate ? new Date(fromDate).toISOString() : null;
//   //   const toDateTime = toDate ? new Date(toDate).toISOString() : null;
  
//   //   const filtered = users.filter((user) => {
//   //     const createdDate = user.$createdAt; // Already in ISO 8601 format
  
//   //     if (fromDateTime && toDateTime) {
//   //       return createdDate >= fromDateTime && createdDate <= toDateTime;
//   //     }
//   //     if (fromDateTime) {
//   //       return createdDate >= fromDateTime;
//   //     }
//   //     if (toDateTime) {
//   //       return createdDate <= toDateTime;
//   //     }
//   //     return true;
//   //   });
  
//   //   setFilteredUsers(filtered);
//   // };
  
//   const handleDateFilter = () => {
//     if (!fromDate && !toDate) {
//       setFilteredUsers(users);
//       return;
//     }
  
//     const fromDateTime = fromDate ? new Date(fromDate).getTime() : null;
//     const toDateTime = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null; // Include entire 'toDate' day.
  
//     const filtered = users.filter((user) => {
//       const createdDateTime = new Date(user.$createdAt).getTime();
  
//       if (fromDateTime && toDateTime) {
//         return createdDateTime >= fromDateTime && createdDateTime <= toDateTime;
//       }
//       if (fromDateTime) {
//         return createdDateTime >= fromDateTime;
//       }
//       if (toDateTime) {
//         return createdDateTime <= toDateTime;
//       }
//       return true;
//     });
  
//     setFilteredUsers(filtered);
//   };
  
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Registered Users Data</h1>

//         <button
//           onClick={() => navigate("/admin-dashboard")}
//           className="mb-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
//         >
//           AppointmentDetails
//         </button>

//         {errorMessage && (
//           <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
//             {errorMessage}
//           </div>
//         )}

//         {/* Date Filters */}
//         <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
//             <input
//               type="date"
//               className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
//             <input
//               type="date"
//               className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//             />
//           </div>
//           <div className="flex items-end">
//             <button
//               onClick={handleDateFilter}
//               className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
//             >
//               Apply Filter
//             </button>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="mb-4">
//           <input
//             type="text"
//             className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Search by Mobile Number..."
//             value={searchQuery}
//             onChange={handleSearch}
//           />
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto border-collapse border border-gray-200">
//             <thead>
//               <tr className="bg-gray-200 text-gray-700">
//                 <th className="border border-gray-300 px-4 py-2">Document ID</th>
//                 <th className="border border-gray-300 px-4 py-2">First Name</th>
//                 <th className="border border-gray-300 px-4 py-2">Last Name</th>
//                 <th className="border border-gray-300 px-4 py-2">Mobile Number</th>
//                 <th className="border border-gray-300 px-4 py-2">Created Date</th>
//                 <th className="border border-gray-300 px-4 py-2">Updated Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => (
//                   <tr key={user.$id} className="hover:bg-gray-100">
//                     <td className="border border-gray-300 px-4 py-2">{user.$id}</td>
//                     <td className="border border-gray-300 px-4 py-2">{user.FirstName || "N/A"}</td>
//                     <td className="border border-gray-300 px-4 py-2">{user.LastName || "N/A"}</td>
//                     <td className="border border-gray-300 px-4 py-2">{user.MobileNumber || "N/A"}</td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {user.$createdAt ? new Date(user.$createdAt).toLocaleString("en-GB") : "N/A"}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {user.$updatedAt ? new Date(user.$updatedAt).toLocaleString("en-GB") : "N/A"}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center text-gray-500 py-4">
//                     No users found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };



import { useState, useEffect } from "react";
import { Account, Client, Databases, Query } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";  // For icons (optional)
import { faUser, faEnvelope, faMobileAlt, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";  // Icons for inputs

const client = new Client()
  .setEndpoint(envt_imports.appwriteUrl)
  .setProject(envt_imports.appwriteProjectId);

const account = new Account(client);
const databases = new Databases(client);

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");  // Date of Birth
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "", registrationNumber: null });

  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const user = await account.get();
        console.log("User is logged in", user);
      } catch (error) {
        console.log("No logged-in user", error);
      }
    };
    checkLoggedInUser();
  }, []);

  const generateRegistrationNumber = () => {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REG-${timestamp}-${randomString}`;
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd format for input field compatibility
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");  // Split into dd, mm, yyyy
    return `${year}-${month}-${day}`;  // Return in yyyy-mm-dd format
  };

  // Convert yyyy-mm-dd to dd/mm/yyyy for form
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");  // Split into yyyy, mm, dd
    return `${day}/${month}/${year}`;  // Return in dd/mm/yyyy format
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    // Prevent multiple submissions
    if (loading) return;
  
    setLoading(true);
    setAlert({ type: "", message: "", registrationNumber: null });
  
    // Validation
    if (!firstName || !lastName || !email || !mobile || !gender || !dob) {
      setAlert({ type: "error", message: "All fields are required." });
      setLoading(false);
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlert({ type: "error", message: "Please enter a valid email address." });
      setLoading(false);
      return;
    }
  
    if (mobile.length !== 10 || isNaN(mobile)) {
      setAlert({ type: "error", message: "Please enter a valid 10-digit mobile number." });
      setLoading(false);
      return;
    }
  
    try {
      // Format Date of Birth to ISO 8601 format (required by Appwrite)
      const [day, month, year] = dob.split("/");  // Parse dd/mm/yyyy
      const formattedDob = new Date(`${year}-${month}-${day}`).toISOString();
  
      // Combine FirstName and LastName
      const patientName = `${firstName} ${lastName}`.trim();
  
      // Query the database for existing entries
      const existingUsersResponse = await databases.listDocuments(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        [
          Query.equal("FirstName", firstName),
          Query.equal("LastName", lastName),
          Query.equal("PatientEmail", email),
          Query.equal("MobileNumber", mobile),
        ]
      );
  
      if (existingUsersResponse.documents.length > 0) {
        setAlert({
          type: "error",
          message: "A user with the same details already exists (Name, Email, or Mobile Number).",
        });
        setLoading(false);
        return;
      }
  
      // Create user in Appwrite Authentication system
      const createdUser = await account.create("unique()", email, "defaultpassword", patientName);
      console.log("User created in Appwrite:", createdUser);
  
      // Create the user document in the Appwrite database
      const registrationNumber = generateRegistrationNumber();
      await databases.createDocument(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        "unique()",
        {
          FirstName: firstName,
          LastName: lastName,
          PatientName: patientName, // Save combined name
          PatientEmail: email,
          MobileNumber: mobile,
          Gender: gender,
          RegistrationNumber: registrationNumber,
          Date_Of_Birth: formattedDob, // Save in ISO 8601 format
        }
      );
  
      // Store user role and registration number in local storage
      localStorage.setItem("role", "user");
      localStorage.setItem("registrationNumber", registrationNumber);
  
      // Show success message
      setAlert({
        type: "success",
        message: "Signup successful! Your Registration Number is displayed below.",
        registrationNumber,
      });
  
      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobile("");
      setGender("");
      setDob("");
      setSuccess(true);
  
    } catch (error) {
      console.error("Signup error:", error);
      setAlert({ type: "error", message: "Signup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Signup</h2>

        {alert.message && (
          <div
            className={`mb-4 text-sm px-4 py-3 rounded ${
              alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {alert.message}
            {alert.type === "success" && (
              <div className="mt-2 text-lg font-semibold">
                Registration Number: <span className="text-blue-700">{alert.registrationNumber}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faMobileAlt} className="text-gray-400" />
              <input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
              <input
                type="date"
                id="dob"
                value={formatDateForInput(dob)}  // Format date for input
                onChange={(e) => setDob(formatDateForDisplay(e.target.value))}  // Format date on change
                required
                className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Signing Up..." : "Signup"}
          </button>
        </form>

        {success && (
          <div className="mt-6 text-center">
            <p className="text-green-700 font-medium mb-4">Signup successful! You can now log in.</p>
            <button
              onClick={handleRedirectToLogin}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;


