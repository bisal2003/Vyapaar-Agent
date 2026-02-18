import React, { useEffect, useState } from 'react'
import { useChatstore } from '../store/useChatstore.js';
import SidebarSkeleton from './skeletons/SidebarSkeleton.jsx';
import { MessageCircle, Search, MoreVertical, Filter, Settings } from 'lucide-react'
import { useAuthstore } from '../store/useAuthstore.js';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {

  const { getUsers, users, selectedUser, setSelectedUser, isUsersloading } = useChatstore();
  const { onlineUsers, authUser } = useAuthstore();
  const [showOnlineonly, setShowOnlineonly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Refresh user list when online users change (new signup)
  useEffect(() => {
    if (onlineUsers.length > 0) {
      getUsers();
    }
  }, [onlineUsers.length]);

  const filterUsers = showOnlineonly 
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const searchedUsers = filterUsers.filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isUsersloading) return <SidebarSkeleton />;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <aside className="h-screen w-full lg:w-[400px] bg-[#111b21] border-r border-[#2a3942] flex flex-col">
      {/* Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate('/profile')}
        >
          <img 
            src={authUser?.profilePic || "/avatar.png"} 
            alt="profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-[#e9edef] font-medium text-base">{authUser?.fullName}</span>
            <span className="text-[#8696a0] text-xs">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <MessageCircle className="w-5 h-5 text-[#aebac1] cursor-pointer hover:text-white transition" />
          <Settings 
            className="w-5 h-5 text-[#aebac1] cursor-pointer hover:text-white transition" 
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#111b21] px-3 py-2">
        <div className="bg-[#202c33] rounded-lg px-4 py-2 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#aebac1]" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[#e9edef] text-sm w-full outline-none placeholder:text-[#667781]"
          />
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-[#111b21] px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => setShowOnlineonly(!showOnlineonly)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            showOnlineonly 
              ? 'bg-[#00a884] text-white' 
              : 'bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942]'
          }`}
        >
          <Filter className="w-4 h-4 inline mr-1" />
          Online ({onlineUsers.length - 1})
        </button>
      </div>

      {/* Chat List */}
      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#374045] scrollbar-track-transparent'>
        {searchedUsers.length === 0 ? (
          <div className="text-center text-[#667781] py-8">
            <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p>No chats found</p>
          </div>
        ) : (
          searchedUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-[#202c33] ${
                  isSelected ? 'bg-[#2a3942]' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 border-b border-[#2a3942] pb-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[#e9edef] font-medium truncate">{user.fullName}</h3>
                    <span className="text-[#667781] text-xs ml-2 flex-shrink-0">
                      {user.lastMessageTime ? formatTime(user.lastMessageTime) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[#667781] text-sm truncate">
                      {isOnline ? 'Online' : 'Tap to chat'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  )
}

export default Sidebar