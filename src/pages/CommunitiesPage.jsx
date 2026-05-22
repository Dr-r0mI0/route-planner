/**
 * Communities Page
 * Lists all communities with join/leave functionality
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api/communities';

export default function CommunitiesPage() {
  const { user, token } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      if (data.success) {
        setCommunities(data.data);
      } else {
        setError(data.error || 'Failed to fetch communities');
      }
    } catch (err) {
      setError('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    try {
      setActionLoading(communityId);
      const response = await fetch(`${API_BASE}/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCommunities(prev => 
          prev.map(c => c.id === communityId ? data.data : c)
        );
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to join community');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (communityId) => {
    if (!token) return;
    
    try {
      setActionLoading(communityId);
      const response = await fetch(`${API_BASE}/${communityId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCommunities(prev => 
          prev.map(c => c.id === communityId ? data.data : c)
        );
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to leave community');
    } finally {
      setActionLoading(null);
    }
  };

  const isMember = (community) => {
    return user && community.members.includes(user.userId);
  };

  return (
    <div className="min-h-screen bg-brand-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-text font-archivo tracking-wide">
            المجتمعات
          </h1>
          <a 
            href="/"
            className="px-4 py-2 rounded-lg bg-brand-border text-brand-text hover:bg-brand-orange/20 transition-colors"
          >
            العودة للخريطة
          </a>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">إغلاق</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-brand-text/70">جاري التحميل...</div>
        ) : communities.length === 0 ? (
          <div className="text-center py-8 text-brand-text/70">
            لا توجد مجتمعات حالياً
          </div>
        ) : (
          <div className="grid gap-4">
            {communities.map(community => (
              <div 
                key={community.id}
                className="p-6 rounded-2xl backdrop-blur-[4px] backdrop-saturate-[1.31] border border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-text font-archivo">
                      {community.name}
                    </h3>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs bg-brand-orange/20 text-brand-orange">
                      {community.category}
                    </span>
                    {community.description && (
                      <p className="mt-3 text-brand-text/70">{community.description}</p>
                    )}
                    <div className="mt-3 text-sm text-brand-text/60">
                      {community.members.length} عضو
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <a 
                      href={`/communities/${community.id}`}
                      className="px-3 py-2 rounded-lg bg-brand-border text-brand-text hover:bg-brand-orange/20 transition-colors mr-2"
                    >
                      دخول
                    </a>
                    {isMember(community) ? (
                      <button
                        onClick={() => handleLeave(community.id)}
                        disabled={actionLoading === community.id}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === community.id ? '...' : 'مغادرة'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(community.id)}
                        disabled={actionLoading === community.id}
                        className="px-4 py-2 rounded-lg bg-brand-orange text-white hover:brightness-110 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === community.id ? '...' : 'انضمام'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}