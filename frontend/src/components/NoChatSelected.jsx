import { MessageCircle, Lock } from 'lucide-react';
import React from 'react'

const NoChatSelected = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#222e35] border-b-8 border-[#00a884]">
      <div className="max-w-md text-center space-y-6 px-8">
        {/* WhatsApp Web Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-52 h-52 rounded-full border-[14px] border-[#2a3942] bg-[#202c33] flex items-center justify-center">
              <MessageCircle className="w-24 h-24 text-[#54656f]" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-4xl font-light text-[#e9edef]">WhatsApp Web</h2>
        <p className="text-[#8696a0] text-sm leading-relaxed">
          Send and receive messages without keeping your phone online.<br />
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </p>

        {/* End-to-end encryption notice */}
        <div className="flex items-center justify-center gap-1 text-[#667781] text-sm pt-8">
          <Lock className="w-4 h-4" />
          <span>Your personal messages are end-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
