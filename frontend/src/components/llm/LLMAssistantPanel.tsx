import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'error';
  jobId?: string;
}

interface LLMAssistantPanelProps {
  onClose: () => void;
}

interface Tool {
  id: string;
  name: string;
  icon: string; 
}

const LLMAssistantPanel: React.FC<LLMAssistantPanelProps> = ({ onClose }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you use the platform, create content with AI tools, and automate workflows. What would you like to do today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested commands
  const suggestedCommands = [
    "Create an image of a mountain landscape with Midjourney",
    "Generate a 10-second video of ocean waves with Kling AI",
    "Create background music for my product video",
    "Help me find all my image files from last week"
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available tools
  useEffect(() => {
    // In a real app, you would fetch this from your API
    const mockTools = [
      { id: 'midjourney', name: 'Midjourney', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzE5MjAzRSIvPjxwYXRoIGQ9Ik0zMyA2NVYzNUw1MCAxOS41TDY3IDM1VjY1TDUwIDgwLjVMMzMgNjVaIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNSIvPjwvc3ZnPg==' },
      { id: 'kling-ai', name: 'Kling AI', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzQ4NEJCQyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik00NSA0MEw2MCA1MEw0NSA2MFY0MFoiIGZpbGw9IiM0ODRCQkMiLz48L3N2Zz4=' },
      { id: 'mmaudio', name: 'MMAudio', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzJBOUM2OCIvPjxwYXRoIGQ9Ik0zMCA1MEg0MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNDUgMzVINTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ1IDUwSDU1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00NSA2NUg1NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNjAgNTBINzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
      { id: 'dalle3', name: 'DALL-E 3', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzEwQTM3RiIvPjxwYXRoIGQ9Ik01MCAyNUw3NSA3NUwyNSA3NUw1MCAyNVoiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=' },
      { id: 'shape-e', name: 'Shape-E', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iI0ZGOTUwMCIvPjxwYXRoIGQ9Ik0zMCA1MEw1MCAzMEw3MCA1MEw1MCA3MEwzMCA1MFoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAzMFY3MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTMwIDUwSDcwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=' },
    ];
    
    setAvailableTools(mockTools);
  }, []);

  // Handle submit of new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    // Process the message and detect intent
    processMessage(userMessage.content);
  };

  // Process user message and detect intent
  const processMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check if the message is about generating content
    if (
      lowerMessage.includes('create') || 
      lowerMessage.includes('generate') || 
      lowerMessage.includes('make')
    ) {
      // Detect which tool to use
      let detectedTool: Tool | undefined;
      let params: Record<string, string> = {};
      
      if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('photo')) {
        if (lowerMessage.includes('midjourney')) {
          detectedTool = availableTools.find(t => t.id === 'midjourney');
        } else {
          detectedTool = availableTools.find(t => t.id === 'dalle3');
        }
        
        // Extract prompt
        const prompt = extractPrompt(message);
        params.prompt = prompt;
      } 
      else if (lowerMessage.includes('video')) {
        detectedTool = availableTools.find(t => t.id === 'kling-ai');
        const prompt = extractPrompt(message);
        params.prompt = prompt;
      }
      else if (lowerMessage.includes('audio') || lowerMessage.includes('music') || lowerMessage.includes('sound')) {
        detectedTool = availableTools.find(t => t.id === 'mmaudio');
        const prompt = extractPrompt(message);
        params.prompt = prompt;
      }
      else if (lowerMessage.includes('3d') || lowerMessage.includes('model')) {
        detectedTool = availableTools.find(t => t.id === 'shape-e');
        const prompt = extractPrompt(message);
        params.prompt = prompt;
      }
      
      if (detectedTool) {
        handleToolExecution(detectedTool, params);
      } else {
        // Generic response for unrecognized generation intent
        respondWithOptions();
      }
    } 
    // Check if the message is about finding or organizing files
    else if (
      lowerMessage.includes('find') || 
      lowerMessage.includes('search') || 
      lowerMessage.includes('where') ||
      lowerMessage.includes('organize') ||
      lowerMessage.includes('list')
    ) {
      // Simulate file system operations
      handleFileOperation(message);
    }
    // Default response for other queries
    else {
      // Generic assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: getGenericResponse(message),
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Extract prompt from user message
  const extractPrompt = (message: string): string => {
    // This is a simplified extraction - in a real app, you would use NLP
    const keywords = ['create', 'generate', 'make', 'with', 'using', 'of', 'about'];
    
    let prompt = message;
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}\\s+(?:an?|the)?\\s+(?:image|picture|video|audio|music|sound|3d model)?\\s+(?:of|about)?\\s+`, 'i');
      prompt = prompt.replace(pattern, '');
    }
    
    // Remove tool names
    const toolNames = availableTools.map(t => t.name.toLowerCase());
    for (const name of toolNames) {
      prompt = prompt.replace(new RegExp(`\\b${name}\\b`, 'i'), '');
    }
    
    return prompt.trim();
  };

  // Handle execution of AI tool
  const handleToolExecution = (tool: Tool, params: Record<string, string>) => {
    // Create a pending message for the user
    const pendingMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I'll help you with that. Let me use ${tool.name} to ${params.prompt ? `create ${params.prompt}` : 'generate content for you'}.`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, pendingMessage]);
    
    // Simulate API call to execute tool
    setTimeout(() => {
      // Create a jobId for tracking
      const jobId = `job-${Math.random().toString(36).substr(2, 9)}`;
      
      // Update with progress message
      const progressMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've started the generation process with ${tool.name}. This might take a minute or two. I'll notify you when it's ready.`,
        timestamp: new Date(),
        status: 'pending',
        jobId,
      };
      
      setMessages(prev => [...prev, progressMessage]);
      
      // After a longer delay, simulate job completion
      setTimeout(() => {
        const completionMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Your request has been completed successfully! You can view and download your ${tool.id.includes('image') ? 'image' : tool.id.includes('video') ? 'video' : tool.id.includes('audio') ? 'audio' : 'content'} from your storage or check the job history tab.`,
          timestamp: new Date(),
          status: 'completed',
          jobId,
        };
        
        setMessages(prev => 
          prev.map(msg => 
            msg.jobId === jobId && msg.status === 'pending'
              ? { ...msg, status: 'completed' }
              : msg
          ).concat(completionMessage)
        );
        
        setIsProcessing(false);
      }, 5000);
    }, 1500);
  };

  // Handle file operations
  const handleFileOperation = (message: string) => {
    setTimeout(() => {
      // Parse the intent
      const lowerMessage = message.toLowerCase();
      let response = '';
      
      if (lowerMessage.includes('find') || lowerMessage.includes('search')) {
        if (lowerMessage.includes('image')) {
          response = "I've searched your storage and found 15 image files. Would you like me to show them to you, or filter them further?";
        } else if (lowerMessage.includes('video')) {
          response = "I've found 7 video files in your storage. You can view them in the Files section. Would you like me to organize them into a folder?";
        } else if (lowerMessage.includes('last week') || lowerMessage.includes('recent')) {
          response = "I've found 23 files from the last week. Would you like me to list them or create a 'Recent Files' folder?";
        } else {
          response = "I can help you find files in your storage. Could you provide more details about what you're looking for?";
        }
      } else if (lowerMessage.includes('organize') || lowerMessage.includes('folder')) {
        response = "I can help organize your files. Would you like me to create folders by file type, date, or project name?";
      } else {
        response = "I can help you manage your files and storage. What specifically would you like to do?";
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  // Respond with available tools
  const respondWithOptions = () => {
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I can help you create content using various AI tools. Here are some options:
        
- Generate images with Midjourney or DALL-E 3
- Create videos with Kling AI
- Make music or sound effects with MMAudio
- Create 3D models with Shape-E

What would you like to create?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  // Get generic response
  const getGenericResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I assist you today with the AI Platform?";
    } else if (lowerMessage.includes('help')) {
      return "I can help you with various tasks such as generating content using AI tools, finding and organizing files, or explaining features of the platform. What would you like help with?";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return "I'm here to help you use the AI Platform. I can assist with generating content using AI tools, managing files, or explaining features. How can I help you today?";
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Assistant</h2>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
        {messages.map(message => (
          <div
            key={message.id}
            className={`chat-message ${
              message.role === 'user' ? 'user' : 'assistant'
            }`}
          >
            <div
              className={`chat-bubble ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              {/* If it's a tool execution and has a tool */}
              {message.status === 'pending' && (
                <div className="flex items-center mb-2">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-500 rounded-full border-t-transparent"></div>
                  <span className="text-xs font-medium">Processing...</span>
                </div>
              )}
              
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              
              {message.status === 'completed' && message.jobId && (
                <div className="mt-2">
                  <button
                    onClick={() => router.push('/dashboard/history')}
                    className="text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-1 rounded hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    View Results
                  </button>
                </div>
              )}
              
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-primary-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {!isProcessing && messages.length < 3 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => setInputValue(command)}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full transition-colors"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type a command or question..."
            className="flex-1 form-control"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputValue.trim()}
            className="btn btn-primary px-4 flex items-center justify-center disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LLMAssistantPanel;
