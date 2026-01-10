import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      // Fetch task stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('assignee_id', user.id);

      const todo = tasks?.filter((t) => t.status === 'todo').length || 0;
      const inProgress = tasks?.filter((t) => t.status === 'in_progress').length || 0;
      const completed = tasks?.filter((t) => t.status === 'done').length || 0;

      // Fetch unread messages
      const { count: unread } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      setStats({
        todoTasks: todo,
        inProgressTasks: inProgress,
        completedTasks: completed,
        unreadMessages: unread || 0,
      });
    }

    fetchStats();
  }, [user]);

  const statCards = [
    {
      name: 'Tasks To Do',
      value: stats.todoTasks,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-red-500',
      link: '/tasks',
    },
    {
      name: 'In Progress',
      value: stats.inProgressTasks,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      link: '/tasks',
    },
    {
      name: 'Completed',
      value: stats.completedTasks,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-green-500',
      link: '/tasks',
    },
    {
      name: 'Unread Messages',
      value: stats.unreadMessages,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      link: '/chat',
    },
  ];

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        {user?.avatar_url ? (
            <img className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm" src={user.avatar_url} alt="" />
        ) : (
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl border-2 border-white shadow-sm">
                {user?.name?.charAt(0) || 'U'}
            </div>
        )}
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-gray-500">Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <Link
            key={item.name}
            to={item.link}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 hover:shadow-md transition-shadow"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </Link>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
             <Link to="/tasks" className="flex items-center p-4 bg-white shadow rounded-lg hover:bg-gray-50">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                    <h3 className="text-sm font-medium text-gray-900">Manage Tasks</h3>
                    <p className="text-xs text-gray-500">View and update your tasks</p>
                </div>
             </Link>
             <Link to="/chat" className="flex items-center p-4 bg-white shadow rounded-lg hover:bg-gray-50">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500 mr-3" />
                <div>
                    <h3 className="text-sm font-medium text-gray-900">Team Chat</h3>
                    <p className="text-xs text-gray-500">Communicate with your team</p>
                </div>
             </Link>
             <Link to="/forum" className="flex items-center p-4 bg-white shadow rounded-lg hover:bg-gray-50">
                <UserGroupIcon className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                    <h3 className="text-sm font-medium text-gray-900">Discussion Forum</h3>
                    <p className="text-xs text-gray-500">Join topic discussions</p>
                </div>
             </Link>
        </div>
      </div>
    </div>
  );
}
