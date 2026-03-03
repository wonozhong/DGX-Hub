import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ForumThread, ForumReply } from '../types';
import { PlusIcon, ChatBubbleLeftIcon, PencilIcon, TrashIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function Forum() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadChannel, setNewThreadChannel] = useState('General');
  const [newThreadVisibility, setNewThreadVisibility] = useState<'public' | 'internal'>('public');
  const [replyUsers, setReplyUsers] = useState<Record<string, { name: string; avatar_url: string | null }>>({}); 
  const [activeTab, setActiveTab] = useState<'public' | 'internal'>('public');
  
  // Edit State
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const channels = ['General', 'Announcements', 'Engineering', 'Design', 'Marketing', 'HR'];

  useEffect(() => {
    fetchThreads();
  }, [activeTab]); // Refetch when tab changes

  useEffect(() => {
    if (selectedThread) {
      fetchReplies(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    // Basic filter: fetch threads based on activeTab
    const { data } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('visibility', activeTab)
      .order('created_at', { ascending: false });
    
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
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: userData } = await supabase.from('users').select('id, name, avatar_url').in('id', userIds);
        if (userData) {
            const userMap: Record<string, { name: string; avatar_url: string | null }> = {};
            userData.forEach(u => userMap[u.id] = { name: u.name, avatar_url: u.avatar_url });
            setReplyUsers(userMap);
        }
    }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newThreadTitle) return;

    // Rate Limit Check
    const { data: lastThread } = await supabase
      .from('forum_threads')
      .select('created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastThread) {
      const lastPostTime = new Date(lastThread.created_at).getTime();
      const now = new Date().getTime();
      const timeDiff = (now - lastPostTime) / 1000; // seconds

      if (timeDiff < 60) {
        toast.error(`Please wait ${Math.ceil(60 - timeDiff)} seconds before creating another thread.`);
        return;
      }
    }

    const thread = {
      title: newThreadTitle,
      channel: newThreadChannel,
      creator_id: user.id,
      visibility: newThreadVisibility,
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

    // Rate Limit Check
    const { data: lastReply } = await supabase
      .from('forum_replies')
      .select('created_at, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastReply) {
      const lastPostTime = new Date(lastReply.created_at).getTime();
      const now = new Date().getTime();
      const timeDiff = (now - lastPostTime) / 1000; // seconds

      // 15 seconds cooldown for replies
      if (timeDiff < 15) {
        toast.error(`Please wait ${Math.ceil(15 - timeDiff)} seconds before replying again.`);
        return;
      }

      // Duplicate Content Check
      if (lastReply.content === newReply) {
          toast.error('You have already posted this reply.');
          return;
      }
    }

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
      setReplyUsers(prev => ({ ...prev, [user.id]: { name: user.name, avatar_url: user.avatar_url } }));
    }
  };

  const handleQuote = (reply: ForumReply) => {
    const authorName = replyUsers[reply.user_id]?.name || 'User';
    // Prefix every line of the content with '> ' to ensure it stays in the quote block
    const quotedContent = reply.content.split('\n').map(line => `> ${line}`).join('\n');
    const quoteText = `> **${authorName}** said:\n${quotedContent}\n\n`;
    setNewReply(quoteText + newReply);
  };

  const handleEdit = (reply: ForumReply) => {
    setEditingReplyId(reply.id);
    setEditContent(reply.content);
  };

  const handleSaveEdit = async () => {
    if (!editingReplyId || !editContent.trim()) return;

    const { error } = await supabase
        .from('forum_replies')
        .update({ content: editContent, updated_at: new Date().toISOString() })
        .eq('id', editingReplyId);

    if (!error) {
        setReplies(replies.map(r => r.id === editingReplyId ? { ...r, content: editContent, updated_at: new Date().toISOString() } : r));
        setEditingReplyId(null);
        setEditContent('');
        toast.success('Reply updated');
    } else {
        toast.error('Failed to update reply');
    }
  };

  const handleDelete = async (replyId: string) => {
      if (!confirm('Are you sure you want to delete this reply?')) return;

      const { error } = await supabase
          .from('forum_replies')
          .delete()
          .eq('id', replyId);

      if (!error) {
          setReplies(replies.filter(r => r.id !== replyId));
          toast.success('Reply deleted');
      } else {
          toast.error('Failed to delete reply');
      }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Are you sure you want to delete this discussion thread? All replies will be deleted as well.')) return;

    // First delete all replies in this thread (although cascade delete on DB might handle this, let's be safe if not configured)
    const { error: repliesError } = await supabase
        .from('forum_replies')
        .delete()
        .eq('thread_id', threadId);

    if (repliesError) {
        toast.error('Failed to delete thread replies');
        return;
    }

    const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId);

    if (!error) {
        setThreads(threads.filter(t => t.id !== threadId));
        if (selectedThread?.id === threadId) {
            setSelectedThread(null);
        }
        toast.success('Discussion thread deleted');
    } else {
        toast.error('Failed to delete thread');
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const result = [];
    let inQuote = false;
    let quoteLines: {depth: number, text: string}[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^([> ]+)/); // Capture all leading > and spaces
      let currentDepth = 0;
      
      if (match) {
          // Count only the '>' characters to determine depth
          currentDepth = (match[0].match(/>/g) || []).length;
      }
      
      const cleanLine = match ? line.substring(match[0].length).trim() : line;

      if (currentDepth > 0) {
        if (!inQuote) {
            inQuote = true;
        }
        quoteLines.push({ depth: currentDepth, text: cleanLine });
      } else {
        if (inQuote) {
          result.push(renderQuoteBlock(quoteLines, i));
          quoteLines = [];
          inQuote = false;
        }
        if (line.trim() !== '') {
            result.push(<p key={`p-${i}`} className="mb-1 min-h-[1.2em]">{line}</p>);
        }
      }
    }
    
    if (inQuote) {
        result.push(renderQuoteBlock(quoteLines, 'end'));
    }
    
    return result;
  };

  const renderQuoteBlock = (lines: {depth: number, text: string}[], keySuffix: string | number) => {
      // Find max depth to know how many nested divs we might need? 
      // Actually, let's just group by depth.
      // This is a simplified nested renderer.
      
      // If all lines have depth 1, render simple box.
      // If some have depth 2, they should be inside a box within depth 1 box.
      
      // Let's process lines:
      // Level 1 container
      //  - text with depth 1
      //  - Level 2 container
      //     - text with depth 2
      
      // We can use a recursive function to render lines.
      return (
          <div key={`quote-${keySuffix}`} className="bg-gray-50 dark:bg-gray-700/30 border-l-4 border-purple-500/50 p-2 mb-3 rounded-r text-xs text-gray-500 dark:text-gray-400 italic">
              {renderNestedQuotes(lines, 1)}
          </div>
      );
  };

  const renderNestedQuotes = (lines: {depth: number, text: string}[], currentLevel: number) => {
      const output = [];
      let currentGroup: {depth: number, text: string}[] = [];
      
      for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.depth === currentLevel) {
              // Flush any deeper group
              if (currentGroup.length > 0) {
                  output.push(
                      <div key={`nested-${currentLevel}-${i}`} className="bg-gray-200/50 dark:bg-gray-600/30 border-l-4 border-purple-400/50 p-2 my-2 rounded-r">
                          {renderNestedQuotes(currentGroup, currentLevel + 1)}
                      </div>
                  );
                  currentGroup = [];
              }
              // Render current line
              output.push(
                <div key={`line-${currentLevel}-${i}`} className={line.text.includes('said:') ? 'font-bold text-purple-600 dark:text-purple-400 mb-1 not-italic' : ''}>
                   {line.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              );
          } else if (line.depth > currentLevel) {
              currentGroup.push(line);
          } else {
              // Should not happen if we structure correctly, but just print it
               output.push(<div key={`orphan-${i}`}>{line.text}</div>);
          }
      }
      
      // Flush remaining group
      if (currentGroup.length > 0) {
          output.push(
              <div key={`nested-end-${currentLevel}`} className="bg-gray-200/50 dark:bg-gray-600/30 border-l-4 border-purple-400/50 p-2 my-2 rounded-r">
                  {renderNestedQuotes(currentGroup, currentLevel + 1)}
              </div>
          );
      }
      
      return output;
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Threads List */}
      <div className={`${selectedThread ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Discussions</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          
          {user?.role !== 'user' && (
              <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('public')}
                    className={`flex-1 py-1 px-2 text-xs font-medium rounded-md transition-all ${
                        activeTab === 'public'
                            ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    Public Community
                </button>
                <button
                    onClick={() => setActiveTab('internal')}
                    className={`flex-1 py-1 px-2 text-xs font-medium rounded-md transition-all ${
                        activeTab === 'internal'
                            ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    Internal Team
                </button>
              </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No discussions yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{thread.title}</p>
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap ml-2">
                      {thread.channel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(thread.created_at), 'MMM d, yyyy')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Thread Details */}
      <div className={`${selectedThread ? 'block' : 'hidden lg:block'} w-full lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow`}>
        {selectedThread ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg flex items-center">
              <button 
                onClick={() => setSelectedThread(null)}
                className="mr-2 lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                &larr; Back
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedThread.title}</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">#{selectedThread.channel}</span>
                    {(user?.id === selectedThread.creator_id || user?.role === 'admin') && (
                        <button 
                            onClick={() => handleDeleteThread(selectedThread.id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Delete Discussion"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900">
              {replies.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10">No replies yet. Be the first to share your thoughts!</div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="flex p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0 mr-4">
                        {replyUsers[reply.user_id]?.avatar_url ? (
                            <img 
                                src={replyUsers[reply.user_id]?.avatar_url!} 
                                alt="" 
                                className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800">
                                {(replyUsers[reply.user_id]?.name || '?').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm flex justify-between items-start">
                        <div>
                            <span className="font-medium text-gray-900 dark:text-white mr-2">{replyUsers[reply.user_id]?.name || 'Unknown User'}</span>
                            <span className="text-gray-500 dark:text-gray-400">{format(new Date(reply.created_at), 'MMM d, HH:mm')}</span>
                            {reply.updated_at && reply.updated_at !== reply.created_at && (
                                <span className="text-xs text-gray-400 ml-2">(edited)</span>
                            )}
                        </div>
                        {user && (
                            <div className="flex space-x-2">
                                <button onClick={() => handleQuote(reply)} className="text-gray-400 hover:text-purple-500 dark:hover:text-purple-400" title="Quote">
                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                </button>
                                {(user.id === reply.user_id || user.role === 'admin') && (
                                    <>
                                        <button onClick={() => handleEdit(reply)} className="text-gray-400 hover:text-green-500 dark:hover:text-green-400" title="Edit">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(reply.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400" title="Delete">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                      </div>
                      
                      {editingReplyId === reply.id ? (
                          <div className="mt-2">
                              <textarea
                                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  rows={3}
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                  <button onClick={() => setEditingReplyId(null)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
                                  <button onClick={handleSaveEdit} className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">Save</button>
                              </div>
                          </div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 whitespace-pre-wrap">
                            {renderContent(reply.content)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendReply} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <div className="flex gap-2">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2 min-h-[100px] max-h-64 resize-y bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendReply(e);
                      }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newReply.trim()}
                  className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 self-end"
                >
                  Reply
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Start New Discussion
                  </Dialog.Title>
                  <form onSubmit={createThread} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic Title</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        placeholder="What's on your mind?"
                      />
                    </div>
                    
                    {user?.role !== 'user' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={newThreadVisibility}
                                onChange={(e) => setNewThreadVisibility(e.target.value as 'public' | 'internal')}
                            >
                                <option value="public">Public (Everyone)</option>
                                <option value="internal">Internal Team Only</option>
                            </select>
                        </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Channel</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
