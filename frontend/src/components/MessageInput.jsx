import { useRef, useState } from "react";
import { useChatstore } from "../store/useChatstore.js";
import { Image, Send, X, Smile, Mic, Paperclip, File } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const { sendMessage, replyingTo, clearReplyingTo } = useChatstore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    }
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        data: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        file: filePreview,
        replyTo: replyingTo?._id || null,
      });

      setText("");
      setImagePreview(null);
      setFilePreview(null);
      clearReplyingTo();
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";

    } catch (error) {
      console.log("Failed in sending messages", error);
      toast.error("Failed to send message");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-[#202c33] px-4 py-3 relative z-20">
      
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 flex items-center gap-2 bg-[#111b21] p-3 rounded-lg border-l-4 border-[#00a884]">
          <div className="flex-1">
            <div className="text-[#00a884] text-xs font-semibold mb-1">
              Replying to message
            </div>
            <div className="text-[#8696a0] text-sm truncate">
              {replyingTo.text || replyingTo.image ? (replyingTo.text || "Image") : "File"}
            </div>
          </div>
          <button
            onClick={clearReplyingTo}
            className="text-[#8696a0] hover:text-white transition"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 bg-[#111b21] p-3 rounded-lg">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center hover:bg-[#06cf9c] transition"
              type="button"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <span className="text-[#e9edef] text-sm">Image ready to send</span>
        </div>
      )}

      {/* File Preview */}
      {filePreview && (
        <div className="mb-3 flex items-center gap-3 bg-[#111b21] p-3 rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-[#00a884] flex items-center justify-center">
            <File className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[#e9edef] text-sm font-medium truncate">{filePreview.name}</div>
            <div className="text-[#8696a0] text-xs">{formatFileSize(filePreview.size)}</div>
          </div>
          <button
            onClick={removeFile}
            className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center hover:bg-[#06cf9c] transition"
            type="button"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#2a3942] rounded-lg px-4 py-2">
          <button
            type="button"
            className="text-[#aebac1] hover:text-white transition"
          >
            <Smile className="w-6 h-6" />
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent text-[#e9edef] text-sm outline-none placeholder:text-[#667781]"
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageInputRef}
            onChange={handleImageChange}
          />

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className="text-[#aebac1] hover:text-white transition"
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="text-[#aebac1] hover:text-white transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Send or Mic Button */}
        {text.trim() || imagePreview || filePreview ? (
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center hover:bg-[#06cf9c] transition"
          >
            <Send className="w-5 h-5 text-[#111b21]" />
          </button>
        ) : (
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center hover:bg-[#06cf9c] transition"
          >
            <Mic className="w-5 h-5 text-[#111b21]" />
          </button>
        )}
      </form>
    </div>
  )
}

export default MessageInput 