import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ETLAIChatProps {
  onSendMessage: (message: string) => void;
  processing: boolean;
  currentStage: string;
}

export default function ETLAIChat({ onSendMessage, processing, currentStage }: ETLAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI ETL assistant. I can help you build, optimize, and deploy ETL pipelines. What would you like to create today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || processing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    onSendMessage(input);
    setInput('');

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(input, currentStage),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const generateAIResponse = (userInput: string, stage: string): string => {
    const responses: { [key: string]: string[] } = {
      configure: [
        "Great choice! I'll help you set up the data sources and targets. What's the primary use case for this ETL pipeline?",
        "I can optimize the configuration based on your data volume and frequency. Are you processing batch or streaming data?",
        "Let me suggest some best practices for connecting to your data sources. Would you like me to add error handling and retry logic?",
      ],
      building: [
        "I've generated an optimized ETL pipeline using PySpark. The code includes proper error handling, logging, and performance optimizations. Would you like me to add any specific transformations?",
        "The pipeline is using incremental loading to minimize data transfer. I can also add data validation checks if needed.",
        "I've added parallel processing for better performance. Would you like to review the transformation logic?",
      ],
      profiling: [
        "The data profiling is complete! I found some interesting patterns in your data. Would you like me to explain the quality metrics?",
        "Based on the data profile, I recommend adding null handling for 3 columns. Should I update the pipeline?",
        "I detected some potential data quality issues. Let me help you fix those before deployment.",
      ],
      deployment: [
        "I can deploy this pipeline to your AWS account using Airflow. The infrastructure will be provisioned automatically. Ready to proceed?",
        "I'll set up monitoring and alerting for this pipeline. Would you like email notifications for failures?",
        "The deployment will use spot instances to reduce costs by 70%. I can also set up auto-scaling if needed.",
      ],
    };

    const stageResponses = responses[stage] || responses.configure;
    return stageResponses[Math.floor(Math.random() * stageResponses.length)];
  };

  const quickActions = [
    'Add data quality checks',
    'Optimize for performance',
    'Add error handling',
    'Generate documentation',
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
          <p className="text-xs text-white/80">Powered by Advanced AI Agents</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'ai'
                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
            }`}>
              {message.type === 'ai' ? (
                <Bot className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
              <div className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] ${
                message.type === 'ai'
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${message.type === 'ai' ? 'text-gray-400' : 'text-white/70'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {processing && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => setInput(action)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-xs font-medium hover:from-purple-100 hover:to-pink-100 transition"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI to modify or enhance your pipeline..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white text-sm"
            disabled={processing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || processing}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
