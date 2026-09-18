"use client";
import { buttonLoader } from '@/app/utils/helper/tokenHelper';
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppSelector } from "./../../../hooks/hooks";


interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState('');
const user = useAppSelector((state) => state.auth.user);
const [conversation, setConversation] = useState<Message[]>([]);

// Initialize conversation when user data is available
useEffect(() => {
  if (user) {
    setConversation([
      {
        role: 'bot',
        content: `Hello ${user.name}! I'm your AI assistant. How's your study going on?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }
}, [user]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);


  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmitPrompt = async () => {
    if (!messages.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to conversation
      const userMessage: Message = {
        role: 'user',
        content: messages,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, userMessage]);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Chatbot",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": [
            {
              "role": "user",
              "content": messages
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response to conversation
      const botMessage: Message = {
        role: 'bot',
        content: data.choices[0]?.message?.content || 'Sorry, I couldn\'t process that.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, botMessage]);
      
      setMessages('');
    } catch (err) {
      console.error('Error:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      setConversation(prev => [
        ...prev,
        {
          role: 'bot',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#035140]/10 to-[#035140]/20 p-4 md:p-6 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col h-full">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border border-[#035140]/20">
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-4 md:p-6 overflow-y-auto scroll-smooth"
          >
            <div className="space-y-4 min-h-full flex flex-col justify-end">
              <div className="space-y-4">
                {conversation.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[90%] md:max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-[#035140] ml-3' : 'bg-[#035140]/10 mr-3'}`}>
                        {message.role === 'user' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#035140]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div>
                        <div className={`rounded-lg py-2 px-4 ${message.role === 'user' ? 'bg-[#035140] text-white' : 'bg-[#035140]/10 text-[#035140]'}`}>
                          {renderContent(message.content)}
                        </div>
                        <p className={`mt-1 text-xs text-[#035140]/60 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%]">
                      <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#035140]/10 mr-3 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#035140]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="bg-[#035140]/10 rounded-lg py-2 px-4 text-[#035140] flex items-center gap-x-4">
                        <span>{buttonLoader}</span> Nice Question {user?.name}, I am thinking!
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-[#035140]/20 p-4 bg-[#035140]/5">
            {error && (
              <div className="mb-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                Error: {error}
              </div>
            )}
            <div className="flex space-x-3">
              <textarea 
                value={messages}
                onChange={(e) => setMessages(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border border-[#035140]/30 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#035140] focus:border-transparent resize-none bg-white"
                rows={2}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitPrompt();
                  }
                }}
              />
              <button 
                onClick={handleSubmitPrompt}
                disabled={isLoading || !messages.trim()}
                className={`self-end rounded-lg p-2 md:p-3 transition duration-200 ${
                  isLoading || !messages.trim()
                    ? 'bg-[#035140]/50 cursor-not-allowed' 
                    : 'bg-[#035140] hover:bg-[#035140]/90'
                } text-white flex items-center justify-center`}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {isLoading ? (
                  buttonLoader
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-[#035140]/60 mt-2 text-center">
              AI assistant may produce inaccurate information about people, places, or facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;