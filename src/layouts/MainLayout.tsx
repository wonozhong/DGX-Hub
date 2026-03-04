import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../lib/supabase';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Tasks', href: '/tasks', icon: ClipboardDocumentCheckIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Forum', href: '/forum', icon: UserGroupIcon },
];

const adminNavigation = { name: 'Admin', href: '/admin', icon: ShieldCheckIcon };

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (!user) return;

    // Update last_seen immediately
    const updatePresence = async () => {
      await supabase.from('users').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
    };
    updatePresence();

    // Update every minute
    const interval = setInterval(updatePresence, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const filteredNavigation = user?.role === 'user' 
    ? navigation.filter(item => ['Dashboard', 'Forum'].includes(item.name))
    : navigation;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component for mobile */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <img 
                        src={isDark ? "/images/dgx-logo-white.svg" : "/images/dgx-logo-black.svg"} 
                        alt="DGX Logo" 
                        className="h-8" 
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {filteredNavigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={cn(
                                    location.pathname === item.href
                                      ? 'bg-gray-50 text-purple-600 dark:bg-gray-800 dark:text-purple-400'
                                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <item.icon
                                    className={cn(
                                      location.pathname === item.href ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400',
                                      'h-6 w-6 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mt-auto">
                          <Link
                            to="/"
                            className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400 mb-2"
                          >
                            <GlobeAltIcon
                              className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400"
                              aria-hidden="true"
                            />
                            Back to Home
                          </Link>
                          <Link
                             to={`/profile/${user?.id}`}
                             className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                          >
                            {user?.avatar_url ? (
                                <img className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 object-cover" src={user.avatar_url} alt="" />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold border border-gray-200 dark:border-gray-700">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <span className="sr-only">Your profile</span>
                            <span aria-hidden="true">{user?.name}</span>
                          </Link>
                           <button
                            onClick={handleSignOut}
                            className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full"
                          >
                            <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400" aria-hidden="true" />
                            Sign out
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
               <img 
                 src={isDark ? "/images/dgx-logo-white.svg" : "/images/dgx-logo-black.svg"} 
                 alt="DGX Logo" 
                 className="h-8" 
               />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {filteredNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            location.pathname === item.href
                              ? 'bg-gray-50 text-purple-600 dark:bg-gray-800 dark:text-purple-400'
                              : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon
                            className={cn(
                              location.pathname === item.href ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                    {user?.role === 'admin' && (
                      <li key={adminNavigation.name}>
                        <Link
                          to={adminNavigation.href}
                          className={cn(
                            location.pathname === adminNavigation.href
                              ? 'bg-gray-50 text-purple-600 dark:bg-gray-800 dark:text-purple-400'
                              : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <adminNavigation.icon
                            className={cn(
                              location.pathname === adminNavigation.href ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {adminNavigation.name}
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
                <li className="mt-auto">
                    <Link
                        to="/"
                        className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400 mb-2"
                    >
                        <GlobeAltIcon
                            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400"
                            aria-hidden="true"
                        />
                        Back to Home
                    </Link>
                    <Link
                         to={`/profile/${user?.id}`}
                         className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                    >
                        {user?.avatar_url ? (
                            <img className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 object-cover" src={user.avatar_url} alt="" />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold border border-gray-200 dark:border-gray-700">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <span className="sr-only">Your profile</span>
                        <span aria-hidden="true">{user?.name}</span>
                    </Link>
                     <button
                        onClick={handleSignOut}
                        className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full"
                      >
                        <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400" aria-hidden="true" />
                        Sign out
                      </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
            {/* Top Bar - No border in dark mode, simplified */}
            <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
              <button type="button" className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden" onClick={() => setSidebarOpen(true)}>
                <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
              <div className="flex flex-1"></div>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
                <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
