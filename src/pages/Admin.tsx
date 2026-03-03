import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [whitelist, setWhitelist] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'whitelist'>('users');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
    fetchWhitelist();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat data pengguna: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhitelist = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_whitelist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWhitelist(data || []);
    } catch (error: any) {
      console.error('Error fetching whitelist:', error);
    }
  };

  const handleAddToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const { data, error } = await supabase
        .from('employee_whitelist')
        .insert([{ email: newEmail.trim() }])
        .select()
        .single();

      if (error) throw error;

      setWhitelist([data, ...whitelist]);
      setNewEmail('');
      toast.success('Email added to whitelist');
    } catch (error: any) {
        if (error.code === '23505') {
            toast.error('Email already in whitelist');
        } else {
            toast.error('Failed to add email: ' + error.message);
        }
    }
  };

  const handleRemoveFromWhitelist = async (id: string) => {
      if (!confirm('Are you sure you want to remove this email?')) return;
      try {
          const { error } = await supabase
              .from('employee_whitelist')
              .delete()
              .eq('id', id);
          
          if (error) throw error;
          
          setWhitelist(whitelist.filter(w => w.id !== id));
          toast.success('Email removed from whitelist');
      } catch (error: any) {
          toast.error('Failed to remove email: ' + error.message);
      }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setFormData({
      department: user.department,
      role: user.role,
      phone_number: user.phone_number
    });
  };

  const handleSave = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, ...formData } : u));
      setEditingUser(null);
      toast.success('Data pengguna berhasil diperbarui');
    } catch (error: any) {
      toast.error('Gagal memperbarui data: ' + error.message);
    }
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Kelola pengguna, departemen, dan hak akses sistem.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'users'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('whitelist')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'whitelist'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Employee Whitelist
                </button>
            </div>
        </div>
      </div>
      
      {activeTab === 'users' ? (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                      Nama / Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Departemen
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      No. Telepon
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">Loading...</td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {u.avatar_url ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={u.avatar_url} alt="" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                            <div className="text-gray-500 dark:text-gray-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {editingUser === u.id ? (
                          <select
                            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-600"
                            value={formData.department || ''}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          >
                            <option value="Guest">Guest</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            u.department === 'Guest' 
                              ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-500/30' 
                              : 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-500/30'
                          }`}>
                            {u.department || 'Guest'}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {editingUser === u.id ? (
                          <select
                            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-600"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                          >
                            <option value="user">User</option>
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`capitalize ${
                             u.role === 'admin' ? 'font-bold text-red-600 dark:text-red-400' :
                             u.role === 'manager' ? 'font-semibold text-purple-600 dark:text-purple-400' :
                             u.role === 'employee' ? 'text-blue-600 dark:text-blue-400' :
                             'text-gray-600 dark:text-gray-400'
                          }`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {editingUser === u.id ? (
                          <input
                            type="text"
                            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-600"
                            value={formData.phone_number || ''}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          />
                        ) : (
                          u.phone_number || '-'
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {editingUser === u.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSave(u.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(u)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      ) : (
          <div className="mt-8">
              <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Add Employee to Whitelist</h3>
                  <form onSubmit={handleAddToWhitelist} className="flex gap-4 mb-8">
                      <input
                          type="email"
                          placeholder="Enter email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 border"
                          required
                      />
                      <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                          Add to Whitelist
                      </button>
                  </form>

                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Whitelisted Emails</h3>
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                                      Email
                                  </th>
                                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                      Added At
                                  </th>
                                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                      <span className="sr-only">Actions</span>
                                  </th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                              {whitelist.length === 0 ? (
                                  <tr>
                                      <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">No emails in whitelist</td>
                                  </tr>
                              ) : whitelist.map((item) => (
                                  <tr key={item.id}>
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                          {item.email}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                          {new Date(item.created_at).toLocaleDateString()}
                                      </td>
                                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                          <button
                                              onClick={() => handleRemoveFromWhitelist(item.id)}
                                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                          >
                                              Remove
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
