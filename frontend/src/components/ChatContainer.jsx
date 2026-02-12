import React, { useEffect, useRef, useState } from 'react'
import { useChatstore } from '../store/useChatstore.js'
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
import MessageSkeleton from './skeletons/MessageSkeleton.jsx';
import { useAuthstore } from '../store/useAuthstore.js';
import { formatMessageTime } from '../lib/utils.js';
import { Check, CheckCheck, File, Download, Reply } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatContainer = () => {

  const { messages, getMessages, isMessagesloading, selectedUser, subscribeToMessages, unsubscribeFromMessages, setReplyingTo } = useChatstore();
  const { authUser } = useAuthstore();
  const messageEndRef = useRef(null);
  const [draggedMessage, setDraggedMessage] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();

      return () => unsubscribeFromMessages();
    }
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDragStart = (e, message) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedMessage(message);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    const dragDistance = Math.abs(e.clientX - (e.currentTarget.getBoundingClientRect().left + dragOffset.x));
    
    if (dragDistance > 80 && draggedMessage) {
      setReplyingTo(draggedMessage);
    }
    
    setDraggedMessage(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.startsWith('video/')) return '🎥';
    if (type?.startsWith('audio/')) return '🎵';
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('word') || type?.includes('document')) return '📝';
    if (type?.includes('sheet') || type?.includes('excel')) return '📊';
    if (type?.includes('zip') || type?.includes('rar')) return '📦';
    return '📎';
  };

  const handleFileView = (fileUrl, fileName, fileType) => {
    try {
      console.log('Opening file:', fileUrl);
      
      // Create a temporary anchor element to avoid popup blockers
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // For PDFs and images, open in new tab (not download)
      if (fileType?.includes('pdf') || fileType?.startsWith('image/')) {
        // Don't set download attribute - let browser open it
        toast.success('Opening file...');
      } else {
        // For other files, suggest download
        link.download = fileName;
      }
      
      // Append to body, click, and remove (avoids popup blocker)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error opening file:', error);
      toast.error('Could not open file');
    }
  };

  const handleFileDownload = (fileUrl, fileName) => {
    try {
      console.log('Downloading file:', fileName);
      toast.success('Downloading file...');
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Download failed');
    }
  };

  if (isMessagesloading) {
    return (
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a] relative h-screen">
      {/* WhatsApp background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <ChatHeader />

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 md:px-[8%] py-3 space-y-2 relative z-10 scrollbar-thin scrollbar-thumb-[#374045] scrollbar-track-transparent'>
        {messages.map((message) => {
          const isOwnMessage = message.senderId === authUser._id;
          return (
            <div 
              key={message._id} 
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
              draggable
              onDragStart={(e) => handleDragStart(e, message)}
              onDragEnd={handleDragEnd}
            >
              <div className={`max-w-[65%] ${isOwnMessage ? 'bg-[#005c4b]' : 'bg-[#202c33]'} rounded-lg px-3 py-2 shadow-md cursor-move transition-transform ${draggedMessage?._id === message._id ? 'scale-95 opacity-70' : ''}`}>
                
                {/* Reply reference */}
                {message.replyTo && (
                  <div className="mb-2 pl-2 border-l-2 border-[#00a884] bg-[#ffffff10] rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Reply className="w-3 h-3 text-[#00a884]" />
                      <span className="text-[#00a884] text-xs font-semibold">Replied to</span>
                    </div>
                    <p className="text-[#8696a0] text-xs truncate">
                      {message.replyTo.text || message.replyTo.image ? (message.replyTo.text || "Image") : "File"}
                    </p>
                  </div>
                )}

                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="rounded-md mb-2 max-w-full cursor-pointer hover:opacity-90"
                    onClick={() => handleFileView(message.image, 'image', 'image/jpeg')}
                  />
                )}

                {message.file && (
                  <div className="mb-2 bg-[#ffffff10] rounded-lg p-3">
                    {/* File preview for images */}
                    {message.file.type?.startsWith('image/') && (
                      <img
                        src={message.file.url}
                        alt={message.file.name}
                        className="rounded-md mb-2 max-w-full cursor-pointer hover:opacity-90"
                        onClick={() => handleFileView(message.file.url, message.file.name, message.file.type)}
                      />
                    )}
                    
                    {/* File info card */}
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getFileIcon(message.file.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#e9edef] text-sm font-medium truncate">{message.file.name}</div>
                        <div className="text-[#8696a0] text-xs">{formatFileSize(message.file.size)}</div>
                      </div>
                      <div className="flex gap-2">
                        {/* View button for PDFs and images */}
                        {(message.file.type?.includes('pdf') || message.file.type?.startsWith('image/')) && (
                          <button
                            onClick={() => handleFileView(message.file.url, message.file.name, message.file.type)}
                            className="text-[#00a884] hover:text-[#06cf9c] transition p-1"
                            title="View"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        )}
                        {/* Download button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDownload(message.file.url, message.file.name);
                          }}
                          className="text-[#00a884] hover:text-[#06cf9c] transition p-1"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {message.text && (
                  <p className="text-[#e9edef] text-sm break-words">{message.text}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <time className="text-[#667781] text-[11px]">
                    {formatMessageTime(message.createdAt)}
                  </time>
                  {isOwnMessage && (
                    <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                  )}
                </div>

                {/* Reply indicator on hover */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Reply className="w-5 h-5 text-[#8696a0]" />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  )
}

export default ChatContainer