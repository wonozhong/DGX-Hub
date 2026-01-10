import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { User, Message } from '../types';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Chat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages(selectedUser.id);
      
      const channel = supabase
        .channel('messages')
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

  const fetchUsers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .select('*')
      .neq('id', user.id); // Exclude current user
    if (data) setUsers(data);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow overflow-hidden">
      {/* Users List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {users.map((u) => (
            <li
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={cn(
                "p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3",
                selectedUser?.id === u.id ? "bg-blue-50" : ""
              )}
            >
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">{u.department || 'Employee'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
              <div 
                className="h-8 w-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-full"
                onClick={() => navigate(`/profile/${selectedUser.id}`)}
              >
                {selectedUser.avatar_url ? (
                    <img className="h-8 w-8 rounded-full object-cover" src={selectedUser.avatar_url} alt="" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                )}
              </div>
              <h3 
                className="text-lg font-medium text-gray-900 cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${selectedUser.id}`)}
              >
                {selectedUser.name}
              </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2 shadow-sm",
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-900 rounded-bl-none"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={cn(
                          "text-[10px] mt-1 text-right",
                          isMe ? "text-blue-100" : "text-gray-400"
                      )}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="inline-flex items-center rounded-full border border-transparent bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
