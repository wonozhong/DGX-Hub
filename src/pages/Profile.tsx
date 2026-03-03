import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Tab } from '@headlessui/react';
import { UserCircleIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/solid';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, setUser: setCurrentUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    phone_number: '',
  });

  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
            avatar_url: data.publicUrl,
            updated_at: new Date().toISOString()
        })
        .eq('id', currentUser!.id);

      if (updateError) {
        throw updateError;
      }
      
      setCurrentUser({ ...currentUser!, avatar_url: data.publicUrl });
      setProfileUser({ ...profileUser!, avatar_url: data.publicUrl });
      toast.success('Avatar updated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const isOwnProfile = !userId || (currentUser && userId === currentUser.id);

  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(currentUser);
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          department: currentUser.department || '',
          phone_number: currentUser.phone_number || '',
        });
      }
    } else {
      fetchUserProfile(userId!);
    }
  }, [userId, currentUser, isOwnProfile]);

  const fetchUserProfile = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfileUser(data);
    } catch (error: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          department: formData.department,
          phone_number: formData.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCurrentUser(data);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileUser) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading profile...</div>;
  if (!profileUser) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            {isOwnProfile ? 'My Profile' : `${profileUser.name}'s Profile`}
          </h2>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex items-center bg-gradient-to-r from-purple-500 to-purple-600">
             <div className="relative h-24 w-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-4xl mr-6 border-4 border-purple-200 dark:border-purple-900 overflow-hidden group">
                  {profileUser.avatar_url ? (
                      <img src={profileUser.avatar_url} alt={profileUser.name} className="h-full w-full object-cover" />
                  ) : (
                      profileUser.name.charAt(0).toUpperCase()
                  )}
                  
                  {isOwnProfile && (
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <PencilIcon className="h-6 w-6 text-white" />
                        <input 
                            id="avatar-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                        />
                    </label>
                  )}
             </div>
             <div className="text-white">
                <h3 className="text-2xl font-bold">{profileUser.name}</h3>
                <p className="text-purple-100">{profileUser.role.toUpperCase()} &bull; {profileUser.department || 'Guest'}</p>
             </div>
          </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-purple-900/20 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow'
                  : 'text-purple-800 dark:text-purple-200 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            Overview
          </Tab>
          {isOwnProfile && (
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow'
                    : 'text-purple-800 dark:text-purple-200 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Edit Profile
            </Tab>
          )}
        </Tab.List>
        <Tab.Panels>
          {/* Overview Tab */}
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white dark:bg-gray-800 p-3 shadow',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2'
            )}
          >
             <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{profileUser.name}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{profileUser.email}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{profileUser.phone_number || '-'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{profileUser.department || 'Guest'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 capitalize">{profileUser.role}</dd>
                </div>
                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member since</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {new Date(profileUser.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </Tab.Panel>

          {/* Edit Profile Tab (Conditional) */}
          {isOwnProfile && (
            <Tab.Panel
              className={classNames(
                'rounded-xl bg-white dark:bg-gray-800 p-3 shadow',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2'
              )}
            >
              <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 sm:p-6">
                 <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                      <input
                        type="text"
                        name="phone_number"
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                      <input
                        type="text"
                        name="department"
                        id="department"
                        disabled // Department usually managed by admin
                        value={formData.department}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 p-2 border cursor-not-allowed"
                        title="Contact admin to change department"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Department can only be changed by Admin.</p>
                    </div>
                 </div>

                 <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                 </div>
              </form>
            </Tab.Panel>
          )}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
