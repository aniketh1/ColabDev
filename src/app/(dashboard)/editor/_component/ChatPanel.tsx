"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import * as Ably from "ably";
import { ChatClient, ChatMessageEvent } from "@ably/chat";

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userImage?: string;
  timestamp: number;
}

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatClientRef = useRef<ChatClient | null>(null);
  const roomRef = useRef<any>(null);
  const { user } = useUser();
  const params = useParams();
  const projectId = params?.projectId as string;

  useEffect(() => {
    if (!user || !projectId) return;

    const initChat = async () => {
      try {
        const ablyClient = new Ably.Realtime({
          key: "tydMYw.lOahyg:uc69YLJIPbWgp6D8cTZnDoUOUwMJjU-M560erKIp4-k",
          clientId: user.id,
        });

        const chatClient = new ChatClient(ablyClient);
        chatClientRef.current = chatClient;

        const room = await chatClient.rooms.get(`project-${projectId}`);
        roomRef.current = room;

        room.messages.subscribe((messageEvent: ChatMessageEvent) => {
          const msg = messageEvent.message;
          const newMessage: Message = {
            id: msg.timeserial || `${Date.now()}-${Math.random()}`,
            text: msg.text || "",
            userId: msg.clientId || "unknown",
            userName: (msg.metadata as any)?.userName || "Anonymous",
            userImage: (msg.metadata as any)?.userImage,
            timestamp: msg.timestamp?.getTime() || Date.now(),
          };
          
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });

        await room.attach();
        setIsConnected(true);
        console.log("Chat connected");
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }
    };

    initChat();

    return () => {
      if (roomRef.current) {
        roomRef.current.detach().catch(console.error);
      }
      if (chatClientRef.current) {
        chatClientRef.current.rooms.release(`project-${projectId}`).catch(console.error);
      }
    };
  }, [user, projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !roomRef.current || !isConnected) return;

    try {
      await roomRef.current.messages.send({
        text: inputValue.trim(),
        metadata: {
          userName: user.fullName || user.username || "Anonymous",
          userImage: user.imageUrl,
        },
      });
      
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-[#3e3e42] bg-[#2d2d30]">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <h3 className="text-white font-medium">Team Chat</h3>
          {isConnected && (
            <span className="w-2 h-2 bg-green-500 rounded-full" title="Connected"></span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}
              >
                <div className="flex-shrink-0">
                  {message.userImage ? (
                    <img
                      src={message.userImage}
                      alt={message.userName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {message.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className={`flex-1 max-w-[75%] ${isCurrentUser ? "text-right" : ""}`}>
                  <div className="text-xs text-gray-400 mb-1">
                    {isCurrentUser ? "You" : message.userName}
                  </div>
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      isCurrentUser
                        ? "bg-blue-600 text-white"
                        : "bg-[#3e3e42] text-gray-200"
                    }`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#3e3e42] bg-[#2d2d30]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 bg-[#3c3c3c] text-white px-3 py-2 rounded-lg border border-[#3e3e42] focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
