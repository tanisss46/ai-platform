import React from 'react';
import Image from 'next/image';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full overflow-hidden ${isUser ? 'ml-2' : 'mr-2'}`}>
          {isUser ? (
            <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white">
              <span>U</span>
            </div>
          ) : (
            <div className="h-full w-full bg-purple-500 flex items-center justify-center text-white">
              <span>AI</span>
            </div>
          )}
        </div>
        
        <div 
          className={`py-2 px-4 rounded-lg ${
            isUser 
              ? 'bg-blue-500 text-white rounded-tr-none' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs mt-1 opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
