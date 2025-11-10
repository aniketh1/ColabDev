"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Message = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
};

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { projectId } = useParams();
  const { user } = useUser();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages (you can integrate with your backend/Liveblocks)
  useEffect(() => {
    // TODO: Load messages from your backend or Liveblocks
    // For now, adding a welcome message
    setMessages([
      {
        id: "1",
        userId: "system",
        userName: "System",
        message: "Welcome to the project chat! Collaborate with your team here.",
        timestamp: Date.now(),
      },
    ]);
  }, [projectId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !user) return;

    setIsSending(true);
    
    try {
      const message: Message = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        userAvatar: user.imageUrl,
        message: newMessage.trim(),
        timestamp: Date.now(),
      };

      // TODO: Send to backend/Liveblocks
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      
      // TODO: Broadcast to other users via Liveblocks
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#007acc] hover:bg-[#005999] text-white rounded-full shadow-lg flex items-center justify-center transition-all z-40"
        title="Open Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-[500px] bg-[#252526] border border-[#2d2d2d] rounded-lg shadow-2xl flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d] bg-[#323233]">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#007acc]" />
          <h3 className="text-sm font-semibold text-[#cccccc]">Team Chat</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#999999] hover:text-[#cccccc] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1e1e1e]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${
              msg.userId === user?.id ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#007acc] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {msg.userAvatar ? (
                <img src={msg.userAvatar} alt={msg.userName} className="w-8 h-8 rounded-full" />
              ) : (
                msg.userName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Message */}
            <div
              className={`flex-1 ${
                msg.userId === user?.id ? "text-right" : "text-left"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[#cccccc]">
                  {msg.userName}
                </span>
                <span className="text-[10px] text-[#999999]">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div
                className={`inline-block px-3 py-2 rounded-lg text-sm ${
                  msg.userId === user?.id
                    ? "bg-[#007acc] text-white"
                    : "bg-[#2a2d2e] text-[#cccccc]"
                }`}
              >
                {msg.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#2d2d2d] bg-[#252526]">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 bg-[#3c3c3c] border-[#2d2d2d] text-white placeholder:text-[#999999] focus:border-[#007acc] text-sm h-9"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            size="icon"
            className="bg-[#007acc] hover:bg-[#005999] text-white h-9 w-9"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
