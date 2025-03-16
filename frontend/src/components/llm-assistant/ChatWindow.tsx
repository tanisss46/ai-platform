import React, { useEffect, useRef, useState } from 'react';
import ChatMessage, { Message, MessageRole } from './ChatMessage';
import ChatInput from './ChatInput';
import TaskStatusIndicator from './TaskStatusIndicator';
import { v4 as uuidv4 } from 'uuid';
import { useCreateLlmCommandMutation } from '../../store/api/apiSlice';

interface ChatWindowProps {
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  minimized = false, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hi! I'm your AI assistant. I can help you use AI tools to create images, videos, and more. What would you like to do today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  
  const [processingCommand, setProcessingCommand] = useState(false);
  const [taskStatus, setTaskStatus] = useState<{
    jobId?: string;
    status: 'idle' | 'planning' | 'executing' | 'completed' | 'failed';
    currentStep?: string;
    progress?: number;
    result?: {
      outputContentIds: string[];
    };
  }>({
    status: 'idle',
  });
  
  const [createLlmCommand] = useCreateLlmCommandMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setProcessingCommand(true);
    setTaskStatus({ status: 'planning' });
    
    try {
      // Send command to backend
      const result = await createLlmCommand({ command: content }).unwrap();
      
      // Add thinking message
      const thinkingMessage: Message = {
        id: uuidv4(),
        content: result.thinking || "Let me analyze your request...",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, thinkingMessage]);
      
      // If there's an immediate response
      if (result.response) {
        const responseMessage: Message = {
          id: uuidv4(),
          content: result.response,
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, responseMessage]);
      }
      
      // Handle job if created
      if (result.jobId) {
        setTaskStatus({
          jobId: result.jobId,
          status: 'executing',
          currentStep: result.currentStep || 'Starting task...',
          progress: 0,
        });
        
        // Polling would happen here in a real application
        // For now, we'll simulate progress updates
        
        // TODO: Replace with actual job polling
        simulateJobProgress(result.jobId);
      } else {
        setTaskStatus({ status: 'idle' });
      }
    } catch (error) {
      console.error('Error processing command:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setTaskStatus({ status: 'failed' });
    } finally {
      setProcessingCommand(false);
    }
  };

  // Temporary function to simulate job progress updates
  // In a real app, this would be replaced with WebSocket or polling
  const simulateJobProgress = (jobId: string) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      
      if (progress <= 100) {
        setTaskStatus((prev) => ({
          ...prev,
          progress,
          currentStep: progress < 50 
            ? 'Generating content...' 
            : progress < 90 
              ? 'Processing results...' 
              : 'Finalizing...',
        }));
      } else {
        clearInterval(interval);
        
        // Add completion message
        const completionMessage: Message = {
          id: uuidv4(),
          content: "I've completed your task! You can find the generated content in your storage.",
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, completionMessage]);
        
        setTaskStatus({
          jobId,
          status: 'completed',
          progress: 100,
          result: {
            outputContentIds: ['simulated-content-id-1', 'simulated-content-id-2'],
          },
        });
      }
    }, 1000);
  };

  return (
    <div className={`flex flex-col ${minimized ? 'h-12' : 'h-full'} bg-white dark:bg-gray-800 shadow-lg rounded-t-lg overflow-hidden transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">AI Assistant</span>
          {processingCommand && (
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {onToggleMinimize && (
            <button 
              onClick={onToggleMinimize}
              className="p-1 rounded hover:bg-blue-500 transition-colors"
            >
              {minimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Chat messages */}
      {!minimized && (
        <>
          <div className="flex-grow overflow-y-auto p-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Task status indicator (shown when a job is being processed) */}
          {taskStatus.status !== 'idle' && (
            <TaskStatusIndicator
              status={taskStatus.status}
              currentStep={taskStatus.currentStep}
              progress={taskStatus.progress}
            />
          )}
          
          {/* Input area */}
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isProcessing={processingCommand} 
          />
        </>
      )}
    </div>
  );
};

export default ChatWindow;
