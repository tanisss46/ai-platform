import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useCreateLlmCommandMutation } from '@/store/api/apiSlice';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'error';
  jobId?: string;
}

const LLMAssistantPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Welcome to AICloud! I can help you use our AI tools.',
      timestamp: new Date(),
    },
  ]);
  
  // API integration
  const [createCommand, { isLoading }] = useCreateLlmCommandMutation();
  
  // Ref for auto-scrolling messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    // Add assistant "thinking" message
    const assistantMessageId = uuidv4();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      status: 'pending',
    };
    
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    
    try {
      // Send command to API
      const response = await createCommand({
        command: inputValue,
      }).unwrap();
      
      // Update assistant message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: response.response || 'I processed your request.',
                status: 'completed',
                jobId: response.jobId,
              }
            : msg
        )
      );
      
      // If a job was created, navigate to it
      if (response.jobId) {
        // You could add a notification or link here
      }
    } catch (error) {
      // Handle error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, something went wrong. Please try again.',
                status: 'error',
              }
            : msg
        )
      );
    }
  };
  
  return (
    <div className="fixed right-0 top-0 h-full z-20 transition-all duration-300 w-96">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-blue-600 text-white p-2 rounded-l-md"
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
      
      {/* Assistant panel */}
      <div className="h-full bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <p className="text-sm opacity-80">Ask me to help with tasks</p>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex"
            >
              <div
                className="max-w-3/4 rounded-lg p-3 bg-gray-100 text-gray-800"
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me something..."
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r-md"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LLMAssistantPanel;