import { X, Phone, Video, Search, MoreVertical } from "lucide-react";
import { useChatstore } from "../store/useChatstore.js";
import { useAuthstore } from "../store/useAuthstore.js";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatstore();
  const { onlineUsers } = useAuthstore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="bg-[#202c33] px-4 py-2.5 border-b border-[#2a3942] relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img 
              src={selectedUser.profilePic || "/avatar.png"} 
              alt={selectedUser.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#202c33]"></div>
            )}
          </div>

          {/* User info */}
          <div className="cursor-pointer">
            <h3 className="text-[#e9edef] font-medium">{selectedUser.fullName}</h3>
            <p className="text-[#667781] text-sm">
              {isOnline ? "online" : "offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Video className="w-5 h-5 text-[#aebac1] cursor-pointer hover:text-white transition" />
          <Phone className="w-5 h-5 text-[#aebac1] cursor-pointer hover:text-white transition" />
          <Search className="w-5 h-5 text-[#aebac1] cursor-pointer hover:text-white transition" />
          <MoreVertical className="w-5 h-5 text-[#aebac1] cursor-pointer hover:text-white transition" />
          <button 
            onClick={() => setSelectedUser(null)}
            className="lg:hidden"
          >
            <X className="w-5 h-5 text-[#aebac1] hover:text-white transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
