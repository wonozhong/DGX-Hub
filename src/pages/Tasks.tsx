import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Task, User } from '../types';
import { cn } from '../lib/utils';
import { Navigate } from 'react-router-dom';

export default function Tasks() {
  const { user } = useAuthStore();
  
  if (user?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    assignee_id: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*');
    if (data) setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const taskData = {
      ...formData,
      creator_id: editingTask ? editingTask.creator_id : user.id,
    };

    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id);
        
      if (!error) {
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
        closeModal();
      }
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();
        
      if (!error && data) {
        setTasks([data, ...tasks]);
        closeModal();
      }
    }
  };

  const deleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    }
  };

  const updateStatus = async (task: Task, newStatus: Task['status']) => {
    const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);
        
    if (!error) {
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee_id: user?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-purple-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-500 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {columns.map((col) => (
          <div key={col.id} className={`p-4 rounded-lg ${col.color} dark:bg-gray-800 min-h-[500px] transition-colors`}>
            <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200 flex justify-between items-center">
                {col.title}
                <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    {tasks.filter(t => t.status === col.id).length}
                </span>
            </h2>
            <div className="space-y-4">
              {tasks
                .filter((task) => task.status === col.id)
                .map((task) => (
                  <div key={task.id} className="p-4 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <div className="flex space-x-1">
                        <button onClick={() => openModal(task)} className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-300 line-clamp-2">{task.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                             <span className={cn(
                                "px-2 py-1 text-xs rounded-full font-medium",
                                task.priority === 'high' ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" :
                                task.priority === 'medium' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                                "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                             )}>
                                {task.priority}
                             </span>
                        </div>
                        {col.id !== 'done' && (
                            <button 
                                onClick={() => updateStatus(task, col.id === 'todo' ? 'in_progress' : 'done')}
                                className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
                            >
                                Move Next &rarr;
                            </button>
                        )}
                         {col.id !== 'todo' && (
                            <button 
                                onClick={() => updateStatus(task, col.id === 'done' ? 'in_progress' : 'todo')}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors"
                            >
                                &larr; Move Back
                            </button>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

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
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                            >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={formData.assignee_id}
                            onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                        >
                             <option value="">Select User</option>
                             {users.map(u => (
                                 <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                             ))}
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-colors"
                      >
                        {editingTask ? 'Save Changes' : 'Create Task'}
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
