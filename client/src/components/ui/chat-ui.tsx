import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { SendIcon, User as UserIcon, Bot, PaperclipIcon } from "lucide-react";
import { sendMessage } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export interface Message {
  id?: number;
  content: string;
  senderId: string;
  timestamp?: Date;
  requestId?: number;
}

interface ChatUIProps {
  requestId: number;
  userId: number | string;
  initialMessages?: Message[];
  onNewMessage?: (message: Message) => void;
  className?: string;
  title?: string;
}

export function ChatUI({
  requestId,
  userId,
  initialMessages = [],
  onNewMessage,
  className = "",
  title = "Chat with AI Assistant"
}: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Focus the input field when the component loads
    inputRef.current?.focus();
  }, []);
  
  // Simulate typing animation for AI responses
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].senderId === "ai") {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    const userMessage: Message = {
      content: inputValue,
      senderId: userId.toString(),
      requestId
    };

    // Optimistically add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      // Send the message to the API
      const response = await sendMessage(requestId, userMessage.content, userMessage.senderId);
      
      // Add AI response if available
      if (response.aiResponse) {
        setMessages((prev) => [...prev, response.aiResponse]);
        if (onNewMessage) {
          onNewMessage(response.aiResponse);
        }
      }
      
      if (onNewMessage) {
        onNewMessage(userMessage);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`flex flex-col overflow-hidden ${className}`}>
      <div className="p-4 bg-primary-700 text-white flex items-center">
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-sm ml-2 font-medium">{title}</span>
      </div>
      
      <ScrollArea className="flex-1 p-4 bg-gray-50 h-[400px]">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-gray-400">
              <div className="mb-3 text-xl">👋</div>
              <p>No messages yet. Start the conversation!</p>
              <p className="text-xs mt-2">Our team is ready to assist you with your request.</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start ${
                    message.senderId === "ai" ? "" : "justify-end"
                  }`}
                >
                  {message.senderId === "ai" && (
                    <div className="flex-shrink-0 mr-3">
                      <Avatar className="h-10 w-10 bg-primary-500 flex items-center justify-center text-white">
                        <Bot className="h-6 w-6" />
                      </Avatar>
                    </div>
                  )}
                  
                  <div
                    className={`p-4 rounded-lg shadow-sm max-w-md ${
                      message.senderId === "ai"
                        ? "bg-white border border-gray-100 rounded-tr-lg rounded-br-lg rounded-bl-lg"
                        : "bg-primary-100 rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                    }`}
                  >
                    <p className="text-gray-800 whitespace-pre-line">{message.content}</p>
                    <div className="text-xs text-gray-400 mt-1 flex justify-end">
                      {message.timestamp ? (
                        formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
                      ) : (
                        "Just now"
                      )}
                    </div>
                  </div>
                  
                  {message.senderId !== "ai" && (
                    <div className="flex-shrink-0 ml-3">
                      <Avatar className="h-10 w-10 bg-gray-300 flex items-center justify-center text-gray-600">
                        <UserIcon className="h-6 w-6" />
                      </Avatar>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <Avatar className="h-10 w-10 bg-primary-500 flex items-center justify-center text-white">
                      <Bot className="h-6 w-6" />
                    </Avatar>
                  </div>
                  <div className="p-4 rounded-lg shadow-sm max-w-md bg-white border border-gray-100 rounded-tr-lg rounded-br-lg rounded-bl-lg">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <CardContent className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex flex-col space-y-3">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pr-10 py-6 text-sm rounded-md border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputValue.trim()) {
                    handleSendMessage(e);
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                // Attachment functionality could be added here
                toast({
                  title: "Coming soon",
                  description: "File attachments will be available soon",
                });
              }}
            >
              <PaperclipIcon className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
            <Button 
              type="submit" 
              className="px-4 py-2" 
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
