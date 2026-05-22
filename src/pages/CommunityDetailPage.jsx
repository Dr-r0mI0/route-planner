/**
 * Community Detail Page
 * Shows community info, members, and chat interface
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api/communities';
const POLL_INTERVAL = 5000;

export default function CommunityDetailPage() {
  const params = { id: window.location.pathname.split('/')[2] };
  const { user, token } = useAuth();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const communityId = params.id;

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);
    }
    
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [communityId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`${API_BASE}/${communityId}`);
      const data = await response.json();
      
      if (data.success) {
        setCommunity(data.data);
      } else {
        setError(data.error || 'Community not found');
      }
    } catch (err) {
      setError('Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE}/${communityId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      const response = await fetch(`${API_BASE}/${communityId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isMember = () => {
    return user && community?.members.includes(user.userId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-brand-text/70">جاري التحميل...</div>
      </div>
    );
  }

  if (error && !community) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/communities" className="text-brand-orange underline">العودة للمجتمعات</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <div className="p-4 backdrop-blur-[4px] backdrop-saturate-[1.31] border-b border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)]">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a 
            href="/communities"
            className="p-2 rounded-lg hover:bg-brand-border transition-colors text-brand-text text-xl"
          >
            ←
          </a>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-brand-text font-archivo">
              {community?.name}
            </h1>
            <span className="text-sm text-brand-orange/80">{community?.category}</span>
          </div>
          <div className="text-sm text-brand-text/60">
            {community?.members.length} عضو
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-brand-text/50">
              لا توجد رسائل بعد. ابدأ المحادثة!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`flex ${message.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.senderId === user?.userId
                      ? 'bg-brand-orange text-white'
                      : 'bg-[rgba(255,255,255,0.1)] text-brand-text'
                  }`}>
                    <div className="text-xs opacity-70 mb-1">
                      {message.senderName} • {formatTime(message.timestamp)}
                    </div>
                    <div className="break-words">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 backdrop-blur-[4px] border-t border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)] fixed bottom-0 left-0 right-0">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-gray-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 rounded-xl bg-brand-orange text-white font-semibold hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '...' : 'إرسال'}
          </button>
        </form>
      </div>
    </div>
  );
}