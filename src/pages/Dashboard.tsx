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
import UserDashboard from './UserDashboard';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'user') {
    return <UserDashboard />;
  }

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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center space-x-4 mb-8">
        {user?.avatar_url ? (
            <img className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" src={user.avatar_url} alt="" />
        ) : (
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-2xl border-2 border-white dark:border-gray-700 shadow-sm">
                {user?.name?.charAt(0) || 'U'}
            </div>
        )}
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <Link
            key={item.name}
            to={item.link}
            className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 hover:shadow-md transition-shadow group"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
            </dd>
          </Link>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
             <Link to="/tasks" className="flex items-center p-4 bg-white dark:bg-gray-800 shadow rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-4">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Manage Tasks</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View and update your tasks</p>
                </div>
             </Link>
             <Link to="/chat" className="flex items-center p-4 bg-white dark:bg-gray-800 shadow rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full mr-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Team Chat</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Communicate with your team</p>
                </div>
             </Link>
             <Link to="/forum" className="flex items-center p-4 bg-white dark:bg-gray-800 shadow rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full mr-4">
                    <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Discussion Forum</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Join topic discussions</p>
                </div>
             </Link>
        </div>
      </div>
    </div>
  );
}
