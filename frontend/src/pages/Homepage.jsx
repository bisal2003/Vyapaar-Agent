import React from 'react'
import { useChatstore } from '../store/useChatstore.js';
import Sidebar from '../components/Sidebar.jsx';
import NoChatSelected from '../components/NoChatSelected.jsx';
import ChatContainer from '../components/ChatContainer.jsx';

const Homepage = () => {
  const { selectedUser } = useChatstore();

  return (
    <div className="h-screen bg-[#111b21]">
      <div className="flex h-full">
        {/* Sidebar - Hidden on mobile when chat is selected */}
        <div className={`${selectedUser ? 'hidden lg:block' : 'block'}`}>
          <Sidebar />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};
export default Homepage;