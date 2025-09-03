import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Phone, MessageSquare, 
  Edit3, Code, Calculator, Clock, Star, Send, Paperclip 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SessionInterfaceProps {
  sessionId: string;
  onEndSession: () => void;
}

const SessionInterface: React.FC<SessionInterfaceProps> = ({ sessionId, onEndSession }) => {
  const { user } = useAuth();
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard' | 'code'>('chat');
  const [message, setMessage] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: '1',
      userId: 'instructor-1',
      userName: 'Dr. Sarah Ahmed',
      text: 'Hi! I see you need help with integration by parts. Let me walk you through it step by step.',
      timestamp: new Date(Date.now() - 120000),
      type: 'text' as const
    },
    {
      id: '2',
      userId: user?.id || 'learner-1',
      userName: user?.name || 'You',
      text: 'Yes, I\'m having trouble with ∫x²e^x dx. I know I need to use integration by parts but I\'m not sure how to set it up.',
      timestamp: new Date(Date.now() - 60000),
      type: 'text' as const
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: user?.id || 'learner-1',
      userName: user?.name || 'You',
      text: message,
      timestamp: new Date(),
      type: 'text' as const
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold text-gray-900">Live Session</span>
            </div>
            <div className="text-sm text-gray-600">
              Mathematics • Integration by Parts
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(sessionTime)}</span>
            </div>
            <div className="text-sm text-gray-600">
              $3.00/15min
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 bg-gray-800 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl font-bold">SA</span>
              </div>
              <p className="text-lg font-medium">Dr. Sarah Ahmed</p>
              <p className="text-sm text-gray-300">Mathematics Instructor</p>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
              <button
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`p-3 rounded-full transition-colors ${
                  isAudioOn ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={onEndSession}
                className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'whiteboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Edit3 className="w-4 h-4 inline mr-2" />
                Board
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'code'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Code
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'chat' && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.userId === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-1">{msg.userName}</div>
                        <div>{msg.text}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={() => {/* Handle file upload */}}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'whiteboard' && (
              <div className="flex-1 p-4">
                <div className="h-full bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Edit3 className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">Shared Whiteboard</p>
                    <p className="text-sm">Draw, write equations, and collaborate visually</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="flex-1 p-4">
                <div className="h-full bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400 mb-2"># Shared Code Editor</div>
                  <div className="text-gray-300">
                    <div className="text-blue-400">def</div>
                    <div className="ml-4">
                      <span className="text-yellow-400">integrate_by_parts</span>
                      <span className="text-white">(u, dv):</span>
                    </div>
                    <div className="ml-8 text-gray-400"># u * v - ∫v * du</div>
                    <div className="ml-8">
                      <span className="text-purple-400">return</span>
                      <span className="text-white"> u * v - integral(v * derivative(u))</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionInterface;