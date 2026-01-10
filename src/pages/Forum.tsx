import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ForumThread, ForumReply } from '../types';
import { PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Forum() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadChannel, setNewThreadChannel] = useState('General');
  const [replyUsers, setReplyUsers] = useState<Record<string, string>>({}); // Map user_id to name

  const channels = ['General', 'Announcements', 'Engineering', 'Design', 'Marketing', 'HR'];

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchReplies(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    const { data } = await supabase.from('forum_threads').select('*').order('created_at', { ascending: false });
    if (data) setThreads(data);
  };

  const fetchReplies = async (threadId: string) => {
    const { data } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
      
    if (data) {
        setReplies(data);
        // Fetch user names for replies
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: userData } = await supabase.from('users').select('id, name').in('id', userIds);
        if (userData) {
            const userMap: Record<string, string> = {};
            userData.forEach(u => userMap[u.id] = u.name);
            setReplyUsers(userMap);
        }
    }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newThreadTitle) return;

    const thread = {
      title: newThreadTitle,
      channel: newThreadChannel,
      creator_id: user.id,
    };

    const { data, error } = await supabase
      .from('forum_threads')
      .insert([thread])
      .select()
      .single();

    if (!error && data) {
      setThreads([data, ...threads]);
      closeModal();
      setNewThreadTitle('');
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedThread || !newReply.trim()) return;

    const reply = {
      thread_id: selectedThread.id,
      user_id: user.id,
      content: newReply,
    };

    const { data, error } = await supabase
      .from('forum_replies')
      .insert([reply])
      .select()
      .single();

    if (!error && data) {
      setReplies([...replies, data]);
      setNewReply('');
      // Optimistically update user map if needed (for current user)
      setReplyUsers(prev => ({ ...prev, [user.id]: user.name }));
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Threads List */}
      <div className={`${selectedThread ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 flex flex-col bg-white rounded-lg shadow`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-medium text-gray-900">Discussions</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No discussions yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{thread.title}</p>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 whitespace-nowrap ml-2">
                      {thread.channel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {format(new Date(thread.created_at), 'MMM d, yyyy')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Thread Details */}
      <div className={`${selectedThread ? 'block' : 'hidden lg:block'} w-full lg:w-2/3 flex flex-col bg-white rounded-lg shadow`}>
        {selectedThread ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center">
              <button 
                onClick={() => setSelectedThread(null)}
                className="mr-2 lg:hidden text-gray-500 hover:text-gray-700"
              >
                &larr; Back
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedThread.title}</h2>
                <span className="text-sm text-gray-500">#{selectedThread.channel}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
              {replies.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No replies yet. Be the first to share your thoughts!</div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {(replyUsers[reply.user_id] || '?').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 mr-2">{replyUsers[reply.user_id] || 'Unknown User'}</span>
                        <span className="text-gray-500">{format(new Date(reply.created_at), 'MMM d, HH:mm')}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        {reply.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendReply} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
                <button
                  type="submit"
                  disabled={!newReply.trim()}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
            <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium">Select a discussion thread</p>
            <p className="text-sm">or create a new one to get started</p>
          </div>
        )}
      </div>

      {/* New Thread Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Start New Discussion
                  </Dialog.Title>
                  <form onSubmit={createThread} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Topic Title</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        placeholder="What's on your mind?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Channel</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={newThreadChannel}
                        onChange={(e) => setNewThreadChannel(e.target.value)}
                      >
                        {channels.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Create Discussion
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
