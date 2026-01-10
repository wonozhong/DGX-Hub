import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { User, Message } from '../types';
import { 
  PaperAirplaneIcon, 
  UserPlusIcon, 
  UsersIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Chat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Data States
  const [friends, setFriends] = useState<User[]>([]);
  const [potentialFriends, setPotentialFriends] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'friends' | 'add_friend'>('friends');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize & Fetch Data
  useEffect(() => {
    if (!user) return;

    fetchFriends();
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
        // The keys are user IDs
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

    return () => {
      supabase.removeChannel(presenceChannel);
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

  const fetchPotentialFriends = async () => {
    if (!user) return;
    
    // Get IDs of current friends + self
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

  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    setLoading(true);
    
    // Insert friendship request
    const { error } = await supabase
      .from('friendships')
      .insert([{
        user_id: user.id,
        friend_id: friendId,
        status: 'accepted' // Auto-accept for demo purposes (or pending if implementing full flow)
      }]);

    if (!error) {
      // Refresh lists
      await fetchFriends();
      await fetchPotentialFriends();
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group Friends by Status
  const onlineFriends = friends.filter(f => onlineUserIds.has(f.id));
  const offlineFriends = friends.filter(f => !onlineUserIds.has(f.id));

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        
        {/* Sidebar Header / Tabs */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chat</h2>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('friends')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'friends' 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Friends
            </button>
            <button
              onClick={() => setActiveTab('add_friend')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'add_friend' 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add Friend
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'friends' ? (
            <div className="p-2 space-y-6">
              
              {/* Online Friends */}
              <div>
                <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Online — {onlineFriends.length}
                </h3>
                <ul className="space-y-1">
                  {onlineFriends.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer flex items-center space-x-3 transition-colors",
                        selectedUser?.id === u.id ? "bg-blue-100" : "hover:bg-gray-100"
                      )}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-green-600">Online</p>
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
                <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Offline — {offlineFriends.length}
                </h3>
                <ul className="space-y-1">
                  {offlineFriends.map((u) => (
                    <li
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer flex items-center space-x-3 transition-colors opacity-75 hover:opacity-100",
                        selectedUser?.id === u.id ? "bg-blue-100 opacity-100" : "hover:bg-gray-100"
                      )}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="h-full w-full object-cover grayscale" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-gray-400 ring-2 ring-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">Offline</p>
                      </div>
                    </li>
                  ))}
                  {offlineFriends.length === 0 && (
                    <p className="px-4 text-xs text-gray-400 italic">No friends offline</p>
                  )}
                </ul>
              </div>

            </div>
          ) : (
            <div className="p-2">
              <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Suggested People
              </h3>
              <ul className="space-y-2">
                {potentialFriends.map((u) => (
                  <li key={u.id} className="p-3 bg-white border border-gray-100 rounded-lg flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.department || 'User'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(u.id)}
                      disabled={loading}
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                      title="Add Friend"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
                {potentialFriends.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No new people to add.</p>
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center space-x-3">
                <div 
                  className="h-10 w-10 cursor-pointer rounded-full overflow-hidden border border-gray-200"
                  onClick={() => navigate(`/profile/${selectedUser.id}`)}
                >
                  {selectedUser.avatar_url ? (
                      <img className="h-full w-full object-cover" src={selectedUser.avatar_url} alt="" />
                  ) : (
                      <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                  )}
                </div>
                <div>
                  <h3 
                    className="text-lg font-bold text-gray-900 cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${selectedUser.id}`)}
                  >
                    {selectedUser.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <span className={cn("h-2 w-2 rounded-full", onlineUserIds.has(selectedUser.id) ? "bg-green-500" : "bg-gray-300")} />
                    <span className="text-xs text-gray-500">
                      {onlineUserIds.has(selectedUser.id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
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
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-900 rounded-bl-none border border-gray-100"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={cn(
                            "text-[10px] mt-1 text-right opacity-70",
                            isMe ? "text-blue-100" : "text-gray-400"
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
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2 items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500 px-4 py-2"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Chat</h3>
            <p className="text-center max-w-xs">Select a friend from the sidebar or add new friends to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
