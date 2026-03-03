import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../lib/supabase';
import { ForumThread, ForumReply } from '../types';
import { PlusIcon, ChatBubbleLeftIcon, ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';

export default function PublicForum() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadChannel, setNewThreadChannel] = useState('General');
  const [replyUsers, setReplyUsers] = useState<Record<string, { name: string; avatar_url: string | null }>>({}); 
  
  // Edit State
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const channels = ['General', 'Game Discussion', 'Feedback', 'Bug Reports', 'Off-Topic'];

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchReplies(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    const { data } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('visibility', 'public')
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
        if (userIds.length > 0) {
            const { data: userData } = await supabase.from('users').select('id, name, avatar_url').in('id', userIds);
            if (userData) {
                const userMap: Record<string, { name: string; avatar_url: string | null }> = {};
                userData.forEach(u => userMap[u.id] = { name: u.name, avatar_url: u.avatar_url });
                setReplyUsers(userMap);
            }
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
      visibility: 'public' as const,
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
      return (
          <div key={`quote-${keySuffix}`} className="bg-gray-700/30 border-l-2 border-yellow-600/50 p-2 mb-3 rounded-r text-xs text-gray-400 italic">
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
              if (currentGroup.length > 0) {
                  output.push(
                      <div key={`nested-${currentLevel}-${i}`} className="bg-gray-800/50 border-l-2 border-yellow-600/30 p-2 my-2 rounded-r">
                          {renderNestedQuotes(currentGroup, currentLevel + 1)}
                      </div>
                  );
                  currentGroup = [];
              }
              output.push(
                <div key={`line-${currentLevel}-${i}`} className={line.text.includes('said:') ? 'font-bold text-yellow-600/70 mb-1 not-italic' : ''}>
                   {line.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              );
          } else if (line.depth > currentLevel) {
              currentGroup.push(line);
          } else {
               output.push(<div key={`orphan-${i}`}>{line.text}</div>);
          }
      }
      
      if (currentGroup.length > 0) {
          output.push(
              <div key={`nested-end-${currentLevel}`} className="bg-gray-800/50 border-l-2 border-yellow-600/30 p-2 my-2 rounded-r">
                  {renderNestedQuotes(currentGroup, currentLevel + 1)}
              </div>
          );
      }
      
      return output;
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <div className="flex-shrink-0 flex items-center">
                    <img src="/images/dgx-logo-white.svg" alt="DGX Logo" className="h-10 w-auto object-contain" />
                </div>
                <span className="text-yellow-500 font-bold text-lg tracking-wider ml-2">COMMUNITY FORUM</span>
            </div>
            <div>
                {!user ? (
                    <Link to="/login" className="bg-yellow-600 text-black hover:bg-yellow-500 px-4 py-2 rounded-full text-sm font-bold transition-all">
                        Sign In to Post
                    </Link>
                ) : (
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <span className="text-gray-300 text-sm hidden md:block">Welcome, {user.name}</span>
                        {user.avatar_url ? (
                            <img 
                                src={user.avatar_url} 
                                alt={user.name} 
                                className="h-8 w-8 rounded-full object-cover border border-yellow-600" 
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-yellow-600 flex items-center justify-center text-black font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-28 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar / Thread List */}
            <div className={`lg:col-span-1 ${selectedThread ? 'hidden lg:block' : 'block'}`}>
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden sticky top-28">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                        <h2 className="text-lg font-bold text-gray-100">Discussions</h2>
                        {user && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-2 bg-yellow-600 text-black rounded-full hover:bg-yellow-500 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                        {threads.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No discussions yet.</div>
                        ) : (
                            <ul className="divide-y divide-gray-700">
                                {threads.map((thread) => (
                                    <li
                                        key={thread.id}
                                        onClick={() => setSelectedThread(thread)}
                                        className={`p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
                                            selectedThread?.id === thread.id ? 'bg-gray-700 border-l-4 border-yellow-500' : 'border-l-4 border-transparent'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="inline-flex items-center rounded-full bg-gray-900 border border-gray-600 px-2 py-0.5 text-[10px] font-medium text-gray-300 uppercase tracking-wide">
                                                {thread.channel}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(thread.created_at), 'MMM d')}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-100 line-clamp-2">{thread.title}</h3>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Thread Details / Chat Area */}
            <div className={`lg:col-span-2 ${selectedThread ? 'block' : 'hidden lg:block'}`}>
                {selectedThread ? (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-[calc(100vh-10rem)]">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-700 flex items-center gap-4 bg-gray-800/50">
                            <button 
                                onClick={() => setSelectedThread(null)}
                                className="lg:hidden text-gray-400 hover:text-white"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">{selectedThread.title}</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-yellow-500">#{selectedThread.channel}</span>
                                    {(user?.id === selectedThread.creator_id || user?.role === 'admin') && (
                                        <button 
                                            onClick={() => handleDeleteThread(selectedThread.id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                            title="Delete Discussion"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {replies.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No replies yet. Be the first to join the conversation!</p>
                                </div>
                            ) : (
                                replies.map((reply) => (
                                    <div key={reply.id} className="flex gap-4 group p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors">
                                        <div className="flex-shrink-0">
                                            {replyUsers[reply.user_id]?.avatar_url ? (
                                                <img 
                                                    src={replyUsers[reply.user_id]?.avatar_url!} 
                                                    alt="" 
                                                    className="h-10 w-10 rounded-full object-cover border border-gray-600"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-300 font-bold">
                                                    {(replyUsers[reply.user_id]?.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-baseline justify-between gap-2 mb-1">
                                                <div>
                                                    <span className="font-bold text-yellow-500 text-sm">{replyUsers[reply.user_id]?.name || 'Unknown User'}</span>
                                                    <span className="text-xs text-gray-500 ml-2">{format(new Date(reply.created_at), 'MMM d, yyyy HH:mm')}</span>
                                                    {reply.updated_at && reply.updated_at !== reply.created_at && (
                                                        <span className="text-xs text-gray-600 ml-2">(edited)</span>
                                                    )}
                                                </div>
                                                {user && (
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleQuote(reply)} className="text-gray-500 hover:text-yellow-500" title="Quote">
                                                            <ChatBubbleLeftIcon className="w-4 h-4" />
                                                        </button>
                                                        {(user.id === reply.user_id || user.role === 'admin') && (
                                                            <>
                                                                <button onClick={() => handleEdit(reply)} className="text-gray-500 hover:text-purple-500" title="Edit">
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDelete(reply.id)} className="text-gray-500 hover:text-red-500" title="Delete">
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
                                                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                                                        rows={3}
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button onClick={() => setEditingReplyId(null)} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                                                        <button onClick={handleSaveEdit} className="text-xs bg-yellow-600 text-black font-bold px-3 py-1 rounded hover:bg-yellow-500">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {renderContent(reply.content)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-700 bg-gray-800">
                            {user ? (
                                <form onSubmit={sendReply} className="flex gap-2">
                                    <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 min-h-[100px] max-h-64 resize-y"
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
                                        className="bg-yellow-600 text-black font-bold px-6 py-2 rounded-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                                    >
                                        Reply
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-2">
                                    <Link to="/login" className="text-yellow-500 hover:underline text-sm">
                                        Log in to participate in this discussion
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-gray-500">
                        <div className="bg-gray-900 p-4 rounded-full mb-4">
                            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Select a Discussion</h3>
                        <p className="max-w-sm text-center text-sm">
                            Choose a topic from the sidebar to view the conversation, or start a new discussion if you have something to share.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Create Modal */}
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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white mb-4">
                    Start New Discussion
                  </Dialog.Title>
                  <form onSubmit={createThread} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Topic Title</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        placeholder="What's on your mind?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Channel</label>
                      <select
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
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
                        className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-500 focus:outline-none"
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
