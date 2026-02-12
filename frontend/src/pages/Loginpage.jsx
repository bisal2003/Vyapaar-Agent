import React, { useState } from 'react'
import { useAuthstore } from '../store/useAuthstore.js';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Loginpage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingin } = useAuthstore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* WhatsApp Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-11 h-11 text-white" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-3xl font-light text-[#e9edef] mb-2">WhatsApp</h1>
          <p className="text-[#8696a0] text-sm">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#202c33] rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-[#e9edef] text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#8696a0]" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-[#2a3942] text-[#e9edef] rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#00a884] transition border border-[#2a3942] placeholder:text-[#667781]"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[#e9edef] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#8696a0]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-[#2a3942] text-[#e9edef] rounded-lg pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-[#00a884] transition border border-[#2a3942] placeholder:text-[#667781]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#8696a0] hover:text-[#e9edef]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#8696a0] hover:text-[#e9edef]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-[#00a884] text-white rounded-lg py-3 font-medium hover:bg-[#06cf9c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoggingin}
            >
              {isLoggingin ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-[#8696a0] text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#00a884] hover:text-[#06cf9c] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;