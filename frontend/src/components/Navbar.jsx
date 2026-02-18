import React, { useState } from 'react'
import { useAuthstore } from '../store/useAuthstore.js';
import { Link } from 'react-router-dom';
import { LogOut, MessagesSquare, Settings, User, BarChart3 } from 'lucide-react';
import Dashboard from './Dashboard.jsx';

const Navbar = () => {

  const { logout, authUser } = useAuthstore();
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40  backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">

          {/* logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessagesSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Vyapaar Agent</h1>
            </Link>
          </div>

          {/* setiing and logout buttons */}
          <div className="flex items-center gap-2">
            {authUser && (
              <button
                onClick={() => setShowDashboard(true)}
                className="btn btn-sm gap-2 btn-primary"
                title="Open Dashboard"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}
            
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
    
    {/* Dashboard Modal */}
    <Dashboard isOpen={showDashboard} onClose={() => setShowDashboard(false)} />
    </>
  )
}

export default Navbar