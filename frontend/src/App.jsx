import { Navigate, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import Loginpage from "./pages/Loginpage.jsx";
import Signuppage from "./pages/Signuppage.jsx";
import Profilepage from "./pages/Profilepage.jsx";
import { useAuthstore } from "./store/useAuthstore.js";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function App() {

  const { authUser, checkAuth, ischekingAuth } = useAuthstore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  if (ischekingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#111b21]">
        <Loader className="size-10 animate-spin text-[#00a884]" />
      </div>
    )
  }

  return (
    <div className="bg-[#111b21]">
      <Routes>
        <Route path="/" element={authUser ? <Homepage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <Signuppage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Loginpage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <Profilepage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f2c34',
            color: '#e9edef',
          },
        }}
      />
    </div>
  )
}
