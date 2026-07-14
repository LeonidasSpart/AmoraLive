'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Send, Phone, Video, Image, Mic, MoreVertical,
  ChevronLeft, Check, CheckCheck, Smile, Paperclip,
  ArrowLeft, Search, Plus, Camera, X, Play, Pause
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  reactions?: { emoji: string; count: number }[];
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    photo: string;
    online: boolean;
    lastSeen?: Date;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isTyping?: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    user: {
      id: 'u1',
      name: 'Sophia',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      online: true,
    },
    lastMessage: 'That sounds amazing! When are you free?',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 1000),
    unreadCount: 2,
    isTyping: true,
  },
  {
    id: '2',
    user: {
      id: 'u2',
      name: 'James',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      online: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    },
    lastMessage: 'Sent a photo',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
  },
  {
    id: '3',
    user: {
      id: 'u3',
      name: 'Emma',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      online: true,
    },
    lastMessage: 'Haha exactly! You get me 😊',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    unreadCount: 0,
  },
];

const mockMessages: Message[] = [
  { id: '1', senderId: 'them', content: 'Hey! I saw we matched 😊', type: 'text', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'read' },
  { id: '2', senderId: 'me', content: 'Hi Sophia! Yes, your profile really caught my eye', type: 'text', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), status: 'read' },
  { id: '3', senderId: 'them', content: 'Aww thank you! I love that you're into photography too', type: 'text', timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), status: 'read' },
  { id: '4', senderId: 'me', content: 'Absolutely! What kind do you prefer? Portraits or landscapes?', type: 'text', timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000), status: 'read' },
  { id: '5', senderId: 'them', content: 'Portraits mostly! I love capturing emotions', type: 'text', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), status: 'read' },
  { id: '6', senderId: 'me', content: 'Same here. We should go on a photo walk sometime!', type: 'text', timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000), status: 'read' },
  { id: '7', senderId: 'them', content: 'That sounds amazing! When are you free?', type: 'text', timestamp: new Date(Date.now() - 2 * 60 * 1000), status: 'delivered' },
];

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: inputText,
      type: 'text',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'them',
        content: 'That sounds perfect! I'm free this weekend 🎉',
        type: 'text',
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const filteredConversations = mockConversations.filter(c =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-midnight-950 flex">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-midnight-800`}>
        {/* Header */}
        <div className="p-4 border-b border-midnight-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <button className="w-10 h-10 bg-amora-500/10 rounded-full flex items-center justify-center hover:bg-amora-500/20 transition-colors">
              <Plus className="w-5 h-5 text-amora-400" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-amora-500 transition-all"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-midnight-900/50 transition-colors border-b border-midnight-800/50 ${
                selectedConversation?.id === conversation.id ? 'bg-midnight-900/50 border-l-2 border-l-amora-500' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conversation.user.photo}
                  alt={conversation.user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.user.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-midnight-950" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm truncate">{conversation.user.name}</h3>
                  <span className="text-xs text-midnight-500">{formatTime(conversation.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-sm text-midnight-400 truncate">
                    {conversation.isTyping ? (
                      <span className="text-amora-400 italic">typing...</span>
                    ) : (
                      conversation.lastMessage
                    )}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="flex-shrink-0 ml-2 w-5 h-5 bg-amora-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-midnight-800 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 -ml-2 hover:bg-midnight-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <img
                  src={selectedConversation.user.photo}
                  alt={selectedConversation.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {selectedConversation.user.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-midnight-950" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{selectedConversation.user.name}</h3>
                <p className="text-xs text-midnight-400">
                  {selectedConversation.user.online
                    ? 'Online'
                    : selectedConversation.user.lastSeen
                    ? `Last seen ${formatTime(selectedConversation.user.lastSeen)}`
                    : 'Offline'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-midnight-800 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-midnight-400" />
                </button>
                <button className="p-2 hover:bg-midnight-800 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-midnight-400" />
                </button>
                <button className="p-2 hover:bg-midnight-800 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-midnight-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-midnight-800 rounded-full text-xs text-midnight-400">
                  You matched with {selectedConversation.user.name}
                </span>
              </div>

              {messages.map((message, index) => {
                const isMe = message.senderId === 'me';
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && showAvatar && (
                        <img
                          src={selectedConversation.user.photo}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                      )}
                      <div className={`${isMe ? 'bg-amora-500 text-white' : 'bg-midnight-800 text-midnight-200'} rounded-2xl px-4 py-2.5`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                          <span className="text-[10px] opacity-70">
                            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            message.status === 'read' ? (
                              <CheckCheck className="w-3 h-3 text-emerald-400" />
                            ) : message.status === 'delivered' ? (
                              <CheckCheck className="w-3 h-3 opacity-50" />
                            ) : (
                              <Check className="w-3 h-3 opacity-50" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2">
                  <img
                    src={selectedConversation.user.photo}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="bg-midnight-800 rounded-2xl px-4 py-3 flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      className="w-2 h-2 bg-midnight-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="w-2 h-2 bg-midnight-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="w-2 h-2 bg-midnight-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-midnight-800">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-midnight-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <Smile className="w-5 h-5 text-midnight-400" />
                </button>
                <button className="p-2 hover:bg-midnight-800 rounded-lg transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-midnight-400" />
                </button>
                <div className="flex-1 bg-midnight-900 border border-midnight-700 rounded-2xl px-4 py-2.5 focus-within:border-amora-500 transition-all">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-transparent text-sm resize-none focus:outline-none max-h-32"
                    style={{ minHeight: '24px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-3 bg-amora-500 rounded-full hover:bg-amora-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-midnight-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-midnight-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm text-midnight-400">Choose someone from your matches to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
