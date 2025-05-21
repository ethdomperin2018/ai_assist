import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bot, SendIcon } from "lucide-react";

export default function DemoChat() {
  const [messages, setMessages] = useState([
    {
      content: "Hello! I'm your personal AI assistant. How can I help you today?",
      sender: "ai"
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      content: inputValue,
      sender: "user"
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse;
      
      if (inputValue.toLowerCase().includes("event") || inputValue.toLowerCase().includes("planning")) {
        aiResponse = {
          content: "I'd be happy to help with your corporate event planning! Here's how we can approach this:\n\n• Venue selection in Boston\n• Catering arrangements\n• Event schedule planning\n• Guest invitations and tracking\n• Audio/visual equipment needs\n\nOur team can handle some or all of these tasks. Would you like us to:\n\n1. Provide a full-service package (estimated $3,500-$5,000)\n2. Handle specific parts of the planning only\n3. Provide guidance for your team to implement",
          sender: "ai"
        };
      } else {
        aiResponse = {
          content: "I'd be happy to help with that! Can you provide more details about what you need assistance with?",
          sender: "ai"
        };
      }
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16" id="demo-chat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">See It In Action</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Experience Our AI Assistant
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-gray-800 dark:bg-gray-900 text-white flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm ml-2">Chat with Assist.ai</span>
          </div>
          
          <div className="p-6 h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800 flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start ${
                  message.sender === "ai" ? "" : "justify-end"
                }`}
              >
                {message.sender === "ai" && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <Bot className="h-6 w-6" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`p-4 rounded-lg shadow-sm max-w-md ${
                    message.sender === "ai"
                      ? "bg-white dark:bg-gray-700 rounded-tr-lg rounded-br-lg rounded-bl-lg"
                      : "bg-primary-100 dark:bg-primary-900/30 rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                  }`}
                >
                  <p className={`${
                    message.sender === "ai" 
                      ? "text-gray-800 dark:text-gray-200" 
                      : "text-gray-800 dark:text-gray-200"
                  } whitespace-pre-line`}>
                    {message.content}
                  </p>
                </div>
                
                {message.sender !== "ai" && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <User className="h-6 w-6" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    <Bot className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm max-w-md rounded-tr-lg rounded-br-lg rounded-bl-lg">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <Input
                type="text"
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-primary-500"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                className="ml-3" 
                disabled={isTyping || !inputValue.trim()}
              >
                <SendIcon className="h-5 w-5 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
