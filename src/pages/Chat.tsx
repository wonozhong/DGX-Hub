import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { User, Message } from '../types';
import { 
  PaperAirplaneIcon, 
  UserPlusIcon, 
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export default function Chat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (user?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Data States
  const [friends, setFriends] = useState<User[]>([]);
  const [potentialFriends, setPotentialFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'friends' | 'add_friend' | 'requests'>('friends');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize & Fetch Data
  useEffect(() => {
    if (!user) return;

    fetchFriends();
    fetchFriendRequests();
    fetchPotentialFriends();

    // Setup Presence for Online Status
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const ids = new Set(Object.keys(state));
        setOnlineUserIds(ids);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUserIds((prev) => new Set(prev).add(key));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            user_id: user.id,
          });
        }
      });

    // Refresh friends list every minute to get updated last_seen
    const friendInterval = setInterval(fetchFriends, 60000);

    return () => {
      supabase.removeChannel(presenceChannel);
      clearInterval(friendInterval);
    };
  }, [user]);

  // 2. Fetch Messages when User Selected
  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages(selectedUser.id);
      
      const channel = supabase
        .channel(`chat:${user.id}:${selectedUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.sender_id === selectedUser.id) {
              setMessages((prev) => [...prev, newMsg]);
              markAsRead(newMsg.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- API Calls ---

  const fetchFriends = async () => {
    if (!user) return;
    // Get all accepted friendships where user is either sender or receiver
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (!friendships) return;

    // Extract friend IDs
    const friendIds = friendships.map(f => 
      f.user_id === user.id ? f.friend_id : f.user_id
    );

    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    // Fetch User Details
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .in('id', friendIds);

    if (usersData) setFriends(usersData);
  };

  const fetchFriendRequests = async () => {
    if (!user) return;
    
    // 1. Fetch Incoming Requests (where I am friend_id and status is pending)
    const { data: incoming } = await supabase
      .from('friendships')
      .select('user_id')
      .eq('friend_id', user.id)
      .eq('status', 'pending');
      
    if (incoming && incoming.length > 0) {
        const requesterIds = incoming.map(r => r.user_id);
        const { data: requesters } = await supabase
            .from('users')
            .select('*')
            .in('id', requesterIds);
        
        if (requesters) setIncomingRequests(requesters);
    } else {
        setIncomingRequests([]);
    }

    // 2. Fetch Sent Requests (where I am user_id and status is pending)
    // This is needed to show "Request Sent" status in the "Add Friend" list
    const { data: sent } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id)
        .eq('status', 'pending');
        
    if (sent) {
        setSentRequests(new Set(sent.map(r => r.friend_id)));
    }
  };

  const fetchPotentialFriends = async () => {
    if (!user) return;
    
    // Get IDs of current friends + self + pending requests
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
      
    const excludeIds = new Set([user.id]);
    if (friendships) {
      friendships.forEach(f => {
        excludeIds.add(f.user_id);
        excludeIds.add(f.friend_id);
      });
    }

    // Fetch users NOT in that list
    const { data: usersData } = await supabase
      .from('users')
      .select('*');

    if (usersData) {
      const filtered = usersData.filter(u => !excludeIds.has(u.id));
      setPotentialFriends(filtered);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
      
    if (data) {
        setMessages(data);
        // Mark unread messages from this user as read
        const unreadIds = data
            .filter(m => m.receiver_id === user.id && !m.is_read)
            .map(m => m.id);
            
        if (unreadIds.length > 0) {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .in('id', unreadIds);
        }
    }
  };

  const markAsRead = async (messageId: string) => {
      await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedUser) return;

    const msg = {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([msg])
      .select()
      .single();

    if (!error && data) {
      setMessages([...messages, data]);
      setNewMessage('');
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    if (!user) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('friendships')
      .insert([{
        user_id: user.id,
        friend_id: friendId,
        status: 'pending' 
      }]);

    if (!error) {
      toast.success('Friend request sent!');
      setSentRequests(prev => new Set(prev).add(friendId));
      // Optionally remove from potential list immediately
      // setPotentialFriends(prev => prev.filter(u => u.id !== friendId)); 
    } else {
        toast.error('Failed to send request');
    }
    setLoading(false);
  };

  const handleAcceptRequest = async (requesterId: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id', requesterId)
        .eq('friend_id', user.id);
        
      if (!error) {
          toast.success('Friend request accepted');
          fetchFriendRequests(); // Refresh requests
          fetchFriends(); // Refresh friends list
      } else {
          toast.error('Failed to accept request');
      }
  };

  const handleRejectRequest = async (requesterId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', requesterId)
        .eq('friend_id', user.id);
        
      if (!error) {
          toast.success('Friend request rejected');
          setIncomingRequests(prev => prev.filter(u => u.id !== requesterId));
      } else {
          toast.error('Failed to reject request');
      }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserOnline = (u: User) => {
    if (onlineUserIds.has(u.id)) return true;
    if (u.last_seen) {
        const lastSeen = new Date(u.last_seen).getTime();
        const diff = new Date().getTime() - lastSeen;
        return diff < 2 * 60 * 1000; // 2 minutes threshold
    }
    return false;
  };

  // Group Friends by Status
  const onlineFriends = friends.filter(f => isUserOnline(f));
  const offlineFriends = friends.filter(f => !isUserOnline(f));

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900">
        
        {/* Sidebar Header / Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Chat</h2>
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('friends')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-xs font-medium rounded-md transition-all",
                activeTab === 'friends' 
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <UsersIcon className="w-4 h-4 mr-1" />
              Friends
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-xs font-medium rounded-md transition-all relative",
                activeTab === 'requests' 
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <ClockIcon className="w-4 h-4 mr-1" />
              Requests
              {incomingRequests.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('add_friend')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-xs font-medium rounded-md transition-all",
                activeTab === 'add_friend' 
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <UserPlusIcon className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'friends' && (
            <div className="p-2 space-y-6">
              
              {/* Online Friends */}
              <div>
                <h3 className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Online — {onlineFriends.length}
                </h3>
                <ul className="space-y-1">
                  {onlineFriends.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer flex items-center space-x-3 transition-colors",
                        selectedUser?.id === u.id ? "bg-purple-100 dark:bg-purple-900/40" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className={cn("absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900", isUserOnline(u) ? "bg-green-400" : "bg-gray-400")} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className={cn("text-xs", isUserOnline(u) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}>
                          {isUserOnline(u) ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </li>
                  ))}
                  {onlineFriends.length === 0 && (
                    <p className="px-4 text-xs text-gray-400 italic">No friends online</p>
                  )}
                </ul>
              </div>

              {/* Offline Friends */}
              <div>
                <h3 className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Offline — {offlineFriends.length}
                </h3>
                <ul className="space-y-1">
                  {offlineFriends.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer flex items-center space-x-3 transition-colors opacity-75 hover:opacity-100",
                        selectedUser?.id === u.id ? "bg-purple-100 dark:bg-purple-900/40 opacity-100" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="h-full w-full object-cover grayscale" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-gray-400 ring-2 ring-white dark:ring-gray-900" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Offline</p>
                      </div>
                    </li>
                  ))}
                  {offlineFriends.length === 0 && (
                    <p className="px-4 text-xs text-gray-400 italic">No friends offline</p>
                  )}
                </ul>
              </div>

            </div>
          )}

          {activeTab === 'requests' && (
             <div className="p-2">
                <h3 className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Incoming Requests — {incomingRequests.length}
                </h3>
                <ul className="space-y-2">
                    {incomingRequests.map((u) => (
                        <li key={u.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.department || 'User'}</p>
                                </div>
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => handleAcceptRequest(u.id)}
                                    className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                    title="Accept"
                                >
                                    <CheckIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleRejectRequest(u.id)}
                                    className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                    title="Reject"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                    {incomingRequests.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No new friend requests.</p>
                        </div>
                    )}
                </ul>
             </div>
          )}

          {activeTab === 'add_friend' && (
            <div className="p-2">
              <h3 className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Suggested People
              </h3>
              <ul className="space-y-2">
                {potentialFriends.map((u) => {
                    const isSent = sentRequests.has(u.id);
                    return (
                        <li key={u.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{u.department || 'User'}</p>
                            </div>
                            </div>
                            {isSent ? (
                                <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    Sent
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleSendFriendRequest(u.id)}
                                    disabled={loading}
                                    className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                    title="Add Friend"
                                >
                                    <UserPlusIcon className="w-5 h-5" />
                                </button>
                            )}
                        </li>
                    )
                })}
                {potentialFriends.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No new people to add.</p>
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm z-10 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div 
                  className="h-10 w-10 cursor-pointer rounded-full overflow-hidden border border-gray-200 dark:border-gray-600"
                  onClick={() => navigate(`/profile/${selectedUser.id}`)}
                >
                  {selectedUser.avatar_url ? (
                      <img className="h-full w-full object-cover" src={selectedUser.avatar_url} alt="" />
                  ) : (
                      <div className="h-full w-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold">
                          {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                  )}
                </div>
                <div>
                  <h3 
                    className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${selectedUser.id}`)}
                  >
                    {selectedUser.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <span className={cn("h-2 w-2 rounded-full", isUserOnline(selectedUser) ? "bg-green-500" : "bg-gray-300")} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isUserOnline(selectedUser) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mb-2" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full animate-fade-in-up",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative",
                          isMe
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={cn(
                            "text-[10px] mt-1 text-right opacity-70",
                            isMe ? "text-purple-100" : "text-gray-400 dark:text-gray-300"
                        )}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2 items-center bg-gray-50 dark:bg-gray-700 rounded-full px-2 py-1 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-2"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Welcome to Chat</h3>
            <p className="text-center max-w-xs">Select a friend from the sidebar or add new friends to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
