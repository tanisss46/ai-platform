import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

interface LLMAssistantProps {
  initialMinimized?: boolean;
}

const LLMAssistant: React.FC<LLMAssistantProps> = ({ 
  initialMinimized = false 
}) => {
  const [minimized, setMinimized] = useState(initialMinimized);

  return (
    <div className="fixed bottom-0 right-4 w-96 z-50 transition-all duration-300">
      <ChatWindow
        minimized={minimized}
        onToggleMinimize={() => setMinimized(!minimized)}
      />
    </div>
  );
};

export default LLMAssistant;
