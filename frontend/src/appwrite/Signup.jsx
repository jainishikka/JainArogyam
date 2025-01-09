import { useState } from "react";
import { Account, Databases, Query, Client } from "appwrite";
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
  const [alert, setAlert] = useState({ type: "", message: "", registrationNumber: null });
  const [loading, setLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState();
  const navigate = useNavigate();

  const formatDateForStorage = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const dayStr = date.getDate().toString().padStart(2, "0");
    const monthStr = (date.getMonth() + 1).toString().padStart(2, "0");
    const yearStr = date.getFullYear().toString();
    
    return `${monthStr}/${dayStr}/${yearStr}`;
  };

 

  // const generateRegistrationNumber = async () => {
  //   const yearLastTwoDigits = new Date().getFullYear().toString().slice(-2);
  
  //   try {
  //     // Fetch the latest registration number from the database
  //     const response = await databases.listDocuments(
  //       envt_imports.appwriteDatabaseId,
  //       envt_imports.appwriteCollection2Id,
  //       [Query.orderDesc("RegistrationNumber"), Query.limit(1)]
  //     );
  
  //     const latestRegistrationNumber =
  //       response.documents.length > 0
  //         ? response.documents[0].RegistrationNumber
  //         : null;
  
  //     // Extract the count from the latest registration number
  //     const currentCount = latestRegistrationNumber
  //       ? parseInt(latestRegistrationNumber.slice(-4), 10)
  //       : 0;
  
  //     // Increment count and pad it to 4 digits
  //     const paddedCount = String(currentCount + 1).padStart(4, "0");
  
  //     // Return the new registration number
  //     return `JAP${yearLastTwoDigits}${paddedCount}`;
  //   } catch (error) {
  //     console.error("Error fetching latest registration number:", error);
  //     throw new Error("Could not generate a new registration number.");
  //   }
  // };
  
  const generateRegistrationNumber = async () => {
    const yearLastTwoDigits = new Date().getFullYear().toString().slice(-2);
  
    try {
      // Fetch the latest registration number from the database
      const response = await databases.listDocuments(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        [Query.orderDesc("RegistrationNumber"), Query.limit(1)]
      );
  
      // If no document exists, set the latest registration number to null
      const latestRegistrationNumber =
        response.documents.length > 0 ? response.documents[0].RegistrationNumber : null;
  
      // If there's no previous registration number, start from 0, else extract the count
      const currentCount = latestRegistrationNumber
        ? parseInt(latestRegistrationNumber.slice(-4), 10) // Extract last 4 digits and parse to integer
        : 0; // If no previous record, start at 0
  
      // Increment the count and pad it to 4 digits
      const paddedCount = String(currentCount + 1).padStart(4, "0");
  
      // Return the new registration number
      return `JAP${yearLastTwoDigits}${paddedCount}`;
    } catch (error) {
      console.error("Error fetching latest registration number:", error);
      throw new Error("Could not generate a new registration number.");
    }
  };
  
  
  
  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (loading) return;
    setLoading(true);
    setAlert({ type: "", message: "", registrationNumber: null });
  
    if (!firstName || !lastName || !gender || !dob) {
      setAlert({ type: "error", message: "First name, last name, gender, and date of birth are required." });
      setLoading(false);
      return;
    }
  
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAlert({ type: "error", message: "Please enter a valid email address." });
      setLoading(false);
      return;
    }
  
    if (mobile && (mobile.length !== 10 || isNaN(mobile))) {
      setAlert({ type: "error", message: "Please enter a valid 10-digit mobile number." });
      setLoading(false);
      return;
    }
  
    try {
      const formattedDob = formatDateForStorage(dob);
      
      const patientName = `${firstName} ${lastName}`.trim();
      
      
      // Create a unique combination string
      const uniqueCombination = `${firstName}|${lastName}|${email || "null"}|${mobile || "null"}`;
      
      // Query for existing users by unique combination
      const existingUsersResponse = await databases.listDocuments(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        [Query.equal("UniqueCombination", uniqueCombination)]
      );
      
      const existingUsers = existingUsersResponse?.documents || [];
  
      // Check if an exact match exists
      if (existingUsers.length > 0) {
        setAlert({
          type: "error",
          message: "User already exists with the same details.",
        });
        setLoading(false);
        return;
      }
  
      // Allow signup for new users
      const registrationNumber = await generateRegistrationNumber();
      
      const createdUser = await databases.createDocument(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        "unique()",
        {
          FirstName: firstName,
          LastName: lastName,
          PatientName: patientName,
          PatientEmail: email || null,
          MobileNumber: mobile || null,
          Gender: gender,
          RegistrationNumber: registrationNumber,
          Date_Of_Birth: formattedDob,
          UniqueCombination: uniqueCombination, 
        }
      );
  
      localStorage.setItem("role", "user");
      localStorage.setItem("registrationNumber", registrationNumber);
  
      setAlert({
        type: "success",
        message: `Signup successful! Your Registration Number is ${registrationNumber}.`,
        registrationNumber,
      });
  
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobile("");
      setGender("");
      setDob("");
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

  const handleCopyRegistrationNumber = () => {
    if (alert.registrationNumber) {
      navigator.clipboard.writeText(alert.registrationNumber);
      setCopyMessage("Registration Number copied to clipboard!");
      setTimeout(() => setCopyMessage(""), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-500">
      <div className="bg-white shadow-xl rounded-xl p-10 max-w-lg w-full">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Signup</h2>

        {alert.message && (
          <div
            className={`p-4 rounded-lg ${
              alert.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {alert.message}
            {alert.registrationNumber && (
              <div className="mt-2 font-semibold">
                Registration Number:{" "}
                <span
                  className="text-blue-800 cursor-pointer underline"
                  onClick={handleCopyRegistrationNumber}
                >
                  {alert.registrationNumber}
                </span>
              </div>
            )}
            {copyMessage && (
              <div className="text-sm text-gray-600 mt-1">{copyMessage}</div>
            )}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Mobile:</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Gender:</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Date of Birth:</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-md font-bold hover:bg-blue-800 transition"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        
<div className="mt-4 text-center">
  <p className="text-gray-700">
    Already have an account?{" "}
    <button
      onClick={handleRedirectToLogin}
      className="text-blue-700 font-semibold underline hover:text-blue-900 transition"
    >
      Login here
    </button>
  </p>
</div>
{/* Admin Dashboard Button */}
<div className="mt-8 text-center">
      <button
        onClick={() => navigate("/admin-dashboard")}
        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-md font-bold hover:from-purple-600 hover:to-indigo-600 transition shadow-lg"
      >
        Live Appointment Diary
      </button>
    </div>
      </div>
    </div>
  );
};

export default Signup;
