import { Navigate, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import Profilepage from "./pages/Profilepage.jsx";
import { useAuthstore } from "./store/useAuthstore.js";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function App() {

  const { authUser, checkAuth, ischekingAuth, quickLogin } = useAuthstore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  const handleQuickStart = (name) => {
    quickLogin(name);
  };

  if (ischekingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#111b21]">
        <Loader className="size-10 animate-spin text-[#00a884]" />
      </div>
    )
  }

  return (
    <div className="bg-[#111b21]">
      {!authUser ? (
        <WelcomePage onStart={handleQuickStart} />
      ) : (
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/profile" element={<Profilepage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}

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
