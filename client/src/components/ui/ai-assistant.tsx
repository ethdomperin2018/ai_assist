import React, { useState } from 'react';
import { Card } from './card';
import { Button } from './button';
import { Input } from './input';
import { Bot } from 'lucide-react';
import { aiService } from '@/lib/openai';

export function AiAssistant() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ content: string; isAi: boolean }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setConversation(prev => [...prev, { content: message, isAi: false }]);
    setIsLoading(true);

    try {
      const response = await aiService.generateResponse([{ role: 'user', content: message }], '');
      setConversation(prev => [...prev, { content: response, isAi: true }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
      <div className="p-4 border-b flex items-center gap-2">
        <Bot className="w-5 h-5 text-primary-600" />
        <span className="font-medium">AI Assistant</span>
      </div>
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {conversation.map((msg, i) => (
          <div key={i} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-2 rounded-lg ${msg.isAi ? 'bg-gray-100' : 'bg-primary-100'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-gray-500">AI is thinking...</div>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>Send</Button>
      </form>
    </Card>
  );
}