// import { useState, useEffect } from "react";
// import { Account, Databases, Query, Client } from "appwrite";
// import envt_imports from "../envt_imports/envt_imports";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // For icons
// import { faUser, faEnvelope, faMobileAlt, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"; // Icons

// const client = new Client()
//   .setEndpoint(envt_imports.appwriteUrl)
//   .setProject(envt_imports.appwriteProjectId);

// const account = new Account(client);
// const databases = new Databases(client);

// const Signup = () => {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState(""); // Date of Birth
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState({ type: "", message: "", registrationNumber: null });

//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkLoggedInUser = async () => {
//       try {
//         const user = await account.get();
//         console.log("User is logged in", user);
//       } catch (error) {
//         console.log("No logged-in user", error);
//       }
//     };
//     checkLoggedInUser();
//   }, []);

//   const generateRegistrationNumber = () => {
//     const timestamp = Date.now().toString();
//     const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
//     return `REG-${timestamp}-${randomString}`;
//   };

//   // Convert dd/mm/yyyy to yyyy-mm-dd format for input field compatibility
//   const formatDateForInput = (dateString) => {
//     if (!dateString) return "";
//     const [day, month, year] = dateString.split("/");
//     return `${year}-${month}-${day}`;
//   };

//   // Convert yyyy-mm-dd to dd/mm/yyyy for form display
//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return "";
//     const [year, month, day] = dateString.split("-");
//     return `${day}/${month}/${year}`;
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();

//     if (loading) return; // Prevent multiple submissions
//     setLoading(true);
//     setAlert({ type: "", message: "", registrationNumber: null });

//     if (!firstName || !lastName || !email || !mobile || !gender || !dob) {
//       setAlert({ type: "error", message: "All fields are required." });
//       setLoading(false);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setAlert({ type: "error", message: "Please enter a valid email address." });
//       setLoading(false);
//       return;
//     }

//     if (mobile.length !== 10 || isNaN(mobile)) {
//       setAlert({ type: "error", message: "Please enter a valid 10-digit mobile number." });
//       setLoading(false);
//       return;
//     }

//     try {
//       const formattedDob = new Date(`${dob}`).toISOString();
//       const patientName = `${firstName} ${lastName}`.trim();

//       const existingUsersResponse = await databases.listDocuments(
//         envt_imports.appwriteDatabaseId,
//         envt_imports.appwriteCollection2Id,
//         [
//           Query.equal("FirstName", firstName),
//           Query.equal("LastName", lastName),
//           Query.equal("PatientEmail", email),
//           Query.equal("MobileNumber", mobile),
//         ]
//       );

//       const existingUsers = existingUsersResponse.documents;
//       if (existingUsers.length > 0) {
//         setAlert({
//           type: "error",
//           message: "User already exists with the same details.",
//         });
//         setLoading(false);
//         return;
//       }

//       const createdUser = await account.create("unique()", email, "defaultpassword", patientName);
//       console.log("User created in Appwrite:", createdUser);

//       const registrationNumber = generateRegistrationNumber();
//       await databases.createDocument(
//         envt_imports.appwriteDatabaseId,
//         envt_imports.appwriteCollection2Id,
//         "unique()",
//         {
//           FirstName: firstName,
//           LastName: lastName,
//           PatientName: patientName,
//           PatientEmail: email,
//           MobileNumber: mobile,
//           Gender: gender,
//           RegistrationNumber: registrationNumber,
//           Date_Of_Birth: formattedDob,
//         }
//       );

//       localStorage.setItem("role", "user");
//       localStorage.setItem("registrationNumber", registrationNumber);

//       setAlert({
//         type: "success",
//         message: `Signup successful! Your Registration Number is ${registrationNumber}.`,
//         registrationNumber,
//       });

//       setFirstName("");
//       setLastName("");
//       setEmail("");
//       setMobile("");
//       setGender("");
//       setDob("");
//       setSuccess(true);
//     } catch (error) {
//       console.error("Signup error:", error);
//       setAlert({ type: "error", message: "Signup failed. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRedirectToLogin = () => {
//     navigate("/login");
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-500">
//       <div className="bg-white shadow-xl rounded-xl p-10 max-w-lg w-full">
//         <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Signup</h2>

//         {alert.message && (
//           <div
//             className={`p-4 rounded-lg ${
//               alert.type === "success"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//             }`}
//           >
//             {alert.message}
//             {alert.registrationNumber && (
//               <div className="mt-2 font-semibold">
//                 Registration Number: <span className="text-blue-800">{alert.registrationNumber}</span>
//               </div>
//             )}
//           </div>
//         )}

//         <form onSubmit={handleSignup}>
//           <div className="mb-4">
//             <label className="block mb-1 font-medium text-gray-600">First Name</label>
//             <div className="flex items-center bg-gray-100 px-3 rounded-md">
//               <FontAwesomeIcon icon={faUser} className="text-gray-400" />
//               <input
//                 type="text"
//                 className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//                 required
//               />
//             </div>
//           </div>
//           <div className="mb-4">
//   <label className="block mb-1 font-medium text-gray-600">Last Name</label>
//   <div className="flex items-center bg-gray-100 px-3 rounded-md">
//     <FontAwesomeIcon icon={faUser} className="text-gray-400" />
//     <input
//       type="text"
//       className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
//       value={lastName}
//       onChange={(e) => setLastName(e.target.value)}
//       required
//     />
//   </div>
// </div>

// <div className="mb-4">
//   <label className="block mb-1 font-medium text-gray-600">Email</label>
//   <div className="flex items-center bg-gray-100 px-3 rounded-md">
//     <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
//     <input
//       type="email"
//       className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
//       value={email}
//       onChange={(e) => setEmail(e.target.value)}
//       required
//     />
//   </div>
// </div>

// <div className="mb-4">
//   <label className="block mb-1 font-medium text-gray-600">Mobile</label>
//   <div className="flex items-center bg-gray-100 px-3 rounded-md">
//     <FontAwesomeIcon icon={faMobileAlt} className="text-gray-400" />
//     <input
//       type="tel"
//       className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
//       value={mobile}
//       onChange={(e) => setMobile(e.target.value)}
//       required
//     />
//   </div>
// </div>

// <div className="mb-4">
//   <label className="block mb-1 font-medium text-gray-600">Gender</label>
//   <div className="flex items-center bg-gray-100 px-3 rounded-md">
//     <FontAwesomeIcon icon={faUser} className="text-gray-400" />
//     <select
//       className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
//       value={gender}
//       onChange={(e) => setGender(e.target.value)}
//       required
//     >
//       <option value="">Select Gender</option>
//       <option value="male">Male</option>
//       <option value="female">Female</option>
//       <option value="other">Other</option>
//     </select>
//   </div>
// </div>

// <div className="mb-4">
//   <label className="block mb-1 font-medium text-gray-600">Date of Birth</label>
//   <div className="flex items-center bg-gray-100 px-3 rounded-md">
//     <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
//     <input
//       type="date"
//       className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
//       value={formatDateForInput(dob)}
//       onChange={(e) => setDob(formatDateForDisplay(e.target.value))}
//       required
//     />
//   </div>
// </div>

//           {/* Repeat similar input groups for lastName, email, mobile, etc. */}
//           <button
//             type="submit"
//             className="w-full bg-blue-700 text-white py-2 rounded-md font-bold hover:bg-blue-800 transition"
//           >
//             {loading ? "Signing Up..." : "Sign Up"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Signup;





import { useState, useEffect } from "react";
import { Account, Databases, Query, Client } from "appwrite";
import envt_imports from "../envt_imports/envt_imports";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // For icons
import { faUser, faEnvelope, faMobileAlt, faCalendarAlt, faClipboard } from "@fortawesome/free-solid-svg-icons"; // Icons

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
  const [dob, setDob] = useState(""); // Date of Birth
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "", registrationNumber: null });
  const [copied, setCopied] = useState(false); // Track copy action
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
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  // Convert yyyy-mm-dd to dd/mm/yyyy for form display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    setAlert({ type: "", message: "", registrationNumber: null });

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
      const formattedDob = new Date(`${dob}`).toISOString();
      const patientName = `${firstName} ${lastName}`.trim();

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

      const existingUsers = existingUsersResponse.documents;
      if (existingUsers.length > 0) {
        setAlert({
          type: "error",
          message: "User already exists with the same details.",
        });
        setLoading(false);
        return;
      }

      const createdUser = await account.create("unique()", email, "defaultpassword", patientName);
      console.log("User created in Appwrite:", createdUser);

      const registrationNumber = generateRegistrationNumber();
      await databases.createDocument(
        envt_imports.appwriteDatabaseId,
        envt_imports.appwriteCollection2Id,
        "unique()",
        {
          FirstName: firstName,
          LastName: lastName,
          PatientName: patientName,
          PatientEmail: email,
          MobileNumber: mobile,
          Gender: gender,
          RegistrationNumber: registrationNumber,
          Date_Of_Birth: formattedDob,
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

  // Handle copy registration number
  const handleCopyRegistrationNumber = () => {
    navigator.clipboard.writeText(alert.registrationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-500">
      <div className="bg-white shadow-xl rounded-xl p-10 max-w-lg w-full">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Signup</h2>

        {alert.message && (
          <div
            className={`p-4 rounded-lg ${
              alert.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {alert.message}
            {alert.registrationNumber && (
              <div className="mt-2 font-semibold">
                Registration Number: 
                <span
                  className="text-blue-800 cursor-pointer"
                  onClick={handleCopyRegistrationNumber}
                >
                  {alert.registrationNumber}
                </span>
                {copied && <span className="text-green-600 ml-2">Copied to clipboard!</span>}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSignup}>
          {/* Input fields here */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-600">First Name</label>
            <div className="flex items-center bg-gray-100 px-3 rounded-md">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              <input
                type="text"
                className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
  <label className="block mb-1 font-medium text-gray-600">Last Name</label>
  <div className="flex items-center bg-gray-100 px-3 rounded-md">
    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
    <input
      type="text"
      className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      required
    />
  </div>
</div>

<div className="mb-4">
  <label className="block mb-1 font-medium text-gray-600">Email</label>
  <div className="flex items-center bg-gray-100 px-3 rounded-md">
    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
    <input
      type="email"
      className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
  </div>
</div>

<div className="mb-4">
  <label className="block mb-1 font-medium text-gray-600">Mobile</label>
  <div className="flex items-center bg-gray-100 px-3 rounded-md">
    <FontAwesomeIcon icon={faMobileAlt} className="text-gray-400" />
    <input
      type="tel"
      className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
      value={mobile}
      onChange={(e) => setMobile(e.target.value)}
      required
    />
  </div>
</div>

<div className="mb-4">
  <label className="block mb-1 font-medium text-gray-600">Gender</label>
  <div className="flex items-center bg-gray-100 px-3 rounded-md">
    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
    <select
      className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      required
    >
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>
</div>

<div className="mb-4">
  <label className="block mb-1 font-medium text-gray-600">Date of Birth</label>
  <div className="flex items-center bg-gray-100 px-3 rounded-md">
    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
    <input
      type="date"
      className="flex-1 py-2 px-2 bg-transparent focus:outline-none"
      value={formatDateForInput(dob)}
      onChange={(e) => setDob(formatDateForDisplay(e.target.value))}
      required
    />
  </div>
</div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-md font-bold hover:bg-blue-800 transition"
          >
            {loading ? (
              <span className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div> {/* Spinner */}
                <span className="ml-2">Signing Up...</span>
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p>
            Already have an account?{" "}
            <button onClick={handleRedirectToLogin} className="text-blue-600">Login here</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

