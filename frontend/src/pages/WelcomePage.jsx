import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const WelcomePage = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111b21] via-[#1f2c34] to-[#111b21] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#00a884] to-[#06cf9c] mb-4 shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Vyapaar Agent</h1>
          <p className="text-[#8696a0] text-lg">AI-Powered Business Assistant</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-[#202c33] rounded-2xl shadow-2xl p-8 border border-[#2a3942]">
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome! 👋</h2>
          <p className="text-[#8696a0] mb-6">
            Enter your name to start chatting with your AI business assistant
          </p>

          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#e9edef] mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Rajesh Kumar"
                className="w-full px-4 py-3 bg-[#2a3942] border border-[#3b4a54] rounded-lg text-white placeholder-[#667781] focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-colors"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00a884] to-[#06cf9c] text-white py-3 rounded-lg font-semibold hover:from-[#06cf9c] hover:to-[#00a884] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Chatting
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-[#2a3942]">
            <p className="text-xs text-[#8696a0] mb-3">✨ What you can do:</p>
            <div className="space-y-2 text-xs text-[#aebac1]">
              <div className="flex items-start gap-2">
                <span className="text-[#00a884]">•</span>
                <span>Chat with AI-powered business assistant</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00a884]">•</span>
                <span>Generate invoices with "@v" tag</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00a884]">•</span>
                <span>View real-time business dashboard</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00a884]">•</span>
                <span>Manage customers and transactions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#667781]">
            Demo Mode - Perfect for Neurathon 2026 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
