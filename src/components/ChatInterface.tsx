import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { ChatMessage } from "@/types";
import VisualizationCard from "./VisualizationCard";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatInterface = ({ messages, isLoading, onSendMessage }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
      setIsExpanded(false);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-expand textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
    setIsExpanded(newHeight > 40);
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full typing-indicator" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full typing-indicator" style={{ animationDelay: '160ms' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full typing-indicator" style={{ animationDelay: '320ms' }}></div>
      </div>
      <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Data Exploration</h3>
              <p className="text-muted-foreground max-w-md">
                Start by asking questions about your data. I can help you explore patterns, 
                create visualizations, and generate insights from your Neo4j database.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Try asking: "Show me the distribution of nodes" or "What are the most connected entities?"</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-primary ml-3' : 'bg-secondary mr-3'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Card className={`p-4 ${
                      message.type === 'user' 
                        ? 'chat-message-user card-elevated' 
                        : 'chat-message-bot card-elevated'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </Card>
                    
                    {message.visualization && (
                      <div className="w-full">
                        <VisualizationCard
                          visualization={message.visualization}
                          isInChat={true}
                          onDownload={() => {
                            // Download implementation would go here
                            console.log('Download visualization:', message.visualization?.id);
                          }}
                          onConfigChange={() => {
                            // Config change implementation would go here
                            console.log('Change config for:', message.visualization?.id);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary mr-3 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <Card className="p-4 chat-message-bot card-elevated">
                    <TypingIndicator />
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Ask a question about your data..."
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="min-h-[40px] max-h-[120px] resize-none pr-12 transition-smooth"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 transition-smooth hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {input.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2 text-right">
              Press Enter to send, Shift+Enter for new line
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;