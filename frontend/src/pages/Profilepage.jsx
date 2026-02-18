import React, { useState } from 'react'
import { useAuthstore } from '../store/useAuthstore.js'
import { Camera, Mail, User, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profilepage = () => {

  const { updateProfile, isUpdatingProfile, authUser, logout } = useAuthstore()
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const handleImageupload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader()
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      updateProfile({ profilePic: base64Image });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='min-h-screen bg-[#111b21]'>
      {/* Header */}
      <div className='bg-[#202c33] px-4 py-6 border-b border-[#2a3942]'>
        <div className='max-w-2xl mx-auto flex items-center gap-4'>
          <button 
            onClick={() => navigate('/')}
            className='text-[#e9edef] hover:text-white transition'
          >
            <ArrowLeft className='w-6 h-6' />
          </button>
          <h1 className="text-xl font-medium text-[#e9edef]">Profile</h1>
        </div>
      </div>

      <div className='max-w-2xl mx-auto p-4 py-8'>
        <div className='bg-[#202c33] rounded-lg p-8 space-y-8 shadow-xl'>
          
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={selectedImage || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-[#2a3942]"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-2 right-2 
                  bg-[#00a884] hover:bg-[#06cf9c]
                  p-3 rounded-full cursor-pointer 
                  transition-all duration-200 shadow-lg
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none opacity-50" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageupload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <div className='text-center'>
              <h2 className="text-2xl font-medium text-[#e9edef]">{authUser?.fullName}</h2>
              <p className="text-sm text-[#8696a0] mt-1">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-[#8696a0] flex items-center gap-2 px-4">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="px-4 py-3 bg-[#2a3942] rounded-lg border border-[#2a3942]">
                <p className='text-[#e9edef]'>{authUser?.fullName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-[#8696a0] flex items-center gap-2 px-4">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <div className="px-4 py-3 bg-[#2a3942] rounded-lg border border-[#2a3942]">
                <p className='text-[#e9edef]'>{authUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-[#111b21] rounded-lg p-6 border border-[#2a3942]">
            <h2 className="text-lg font-medium text-[#e9edef] mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-3 border-b border-[#2a3942]">
                <span className='text-[#8696a0]'>Member Since</span>
                <span className='text-[#e9edef]'>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className='text-[#8696a0]'>Account Status</span>
                <span className="text-[#00a884] font-medium">Active</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profilepage