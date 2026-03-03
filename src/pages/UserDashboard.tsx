import { useAuthStore } from '../stores/authStore';
import { UserGroupIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center space-x-4 mb-8">
        {user?.avatar_url ? (
          <img 
            className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" 
            src={user.avatar_url} 
            alt="" 
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-2xl border-2 border-white dark:border-gray-700 shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome to the DGX Hub community portal.</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link 
            to={`/profile/${user?.id}`} 
            className="flex items-center p-6 bg-white dark:bg-gray-800 shadow rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-purple-500"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full mr-4">
              <UserCircleIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Profile</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and edit your profile</p>
            </div>
          </Link>

          <Link 
            to="/forum" 
            className="flex items-center p-6 bg-white dark:bg-gray-800 shadow rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-purple-500"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full mr-4">
              <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Community Forum</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Join discussions and topics</p>
            </div>
          </Link>

          {/* Placeholder for future feature */}
          <div className="flex items-center p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg opacity-75 cursor-not-allowed">
            <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Direct Messages</h3>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Latest Announcements</h3>
        <p className="text-gray-500 dark:text-gray-400">No new announcements at this time.</p>
      </div>
    </div>
  );
}
