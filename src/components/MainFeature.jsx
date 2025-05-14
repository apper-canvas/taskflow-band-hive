import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import getIcon from '../utils/iconUtils';

function MainFeature({ activeTab }) {
  // Icons declaration
  const PlusIcon = getIcon('Plus');
  const XIcon = getIcon('X');
  const TrashIcon = getIcon('Trash2');
  const EditIcon = getIcon('Edit');
  const SaveIcon = getIcon('Save');
  const FlagIcon = getIcon('Flag');
  const CalendarIcon = getIcon('Calendar');
  const CheckIcon = getIcon('Check');
  const InfoIcon = getIcon('Info');
  const TagIcon = getIcon('Tag');
  const FilterIcon = getIcon('Filter');
  const SearchIcon = getIcon('Search');

  // State declarations
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      {
        id: '1',
        title: 'Complete project presentation',
        description: 'Prepare slides and demo for the client meeting',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2023-06-15',
        createdAt: '2023-06-01',
        tags: ['Work', 'Presentation']
      },
      {
        id: '2',
        title: 'Buy groceries',
        description: 'Get milk, eggs, bread, and vegetables',
        priority: 'Medium',
        status: 'Not Started',
        dueDate: '2023-06-10',
        createdAt: '2023-06-05',
        tags: ['Personal', 'Shopping']
      },
      {
        id: '3',
        title: 'Workout session',
        description: '30 minutes cardio and strength training',
        priority: 'Low',
        status: 'Completed',
        dueDate: '2023-06-08',
        createdAt: '2023-06-02',
        completedAt: '2023-06-08',
        tags: ['Health', 'Personal']
      }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd'),
    tags: ''
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks based on activeTab, search query, and priority filter
  const filteredTasks = tasks.filter(task => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'pending' && task.status !== 'Completed') ||
      (activeTab === 'completed' && task.status === 'Completed');
    
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPriority = 
      priorityFilter === 'All' || task.priority === priorityFilter;
    
    return matchesTab && matchesSearch && matchesPriority;
  });

  // Form handling functions
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        tags: task.tags.join(', ')
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Not Started',
        dueDate: format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd'),
        tags: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Task title cannot be empty!");
      return;
    }

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      tags: tagsArray
    };

    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { 
              ...task, 
              ...taskData, 
              completedAt: taskData.status === 'Completed' && task.status !== 'Completed' 
                ? format(new Date(), 'yyyy-MM-dd')
                : task.completedAt
            } 
          : task
      );
      
      setTasks(updatedTasks);
      toast.success("Task updated successfully!");
    } else {
      // Create new task
      const newTask = {
        id: Date.now().toString(),
        ...taskData,
        createdAt: format(new Date(), 'yyyy-MM-dd')
      };
      
      setTasks(prev => [newTask, ...prev]);
      toast.success("Task created successfully!");
    }
    
    closeModal();
  };

  const deleteTask = (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success("Task deleted successfully!");
    }
  };

  const toggleTaskStatus = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'Completed' ? format(new Date(), 'yyyy-MM-dd') : null
        };
      }
      return task;
    }));
    
    toast.info("Task status updated!");
  };

  const priorityColorClasses = {
    High: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  };

  const statusColorClasses = {
    "Not Started": "bg-surface-200 text-surface-800 dark:bg-surface-700 dark:text-surface-300",
    "In Progress": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    "Completed": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "On Hold": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
  };

  const getPriorityLabel = (priority) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColorClasses[priority]}`}>
        <FlagIcon className="w-3 h-3 mr-1" />
        {priority}
      </span>
    );
  };

  const getStatusLabel = (status) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClasses[status]}`}>
        {status === "Completed" ? <CheckIcon className="w-3 h-3 mr-1" /> : null}
        {status}
      </span>
    );
  };

  return (
    <div className="mb-20">
      {/* Controls section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-surface-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-4 w-4 text-surface-400" />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field pl-9 pr-8 py-2 appearance-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <motion.button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Task</span>
          </motion.button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="neu-card hover:shadow-card transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${task.status === 'Completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-surface-400 dark:border-surface-500 hover:border-green-500 dark:hover:border-green-500'
                        }`}
                      aria-label={task.status === 'Completed' ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.status === 'Completed' && <CheckIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium ${task.status === 'Completed' ? 'line-through text-surface-500 dark:text-surface-400' : ''}`}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className="text-surface-600 dark:text-surface-400 mt-1 text-sm">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getPriorityLabel(task.priority)}
                      {getStatusLabel(task.status)}
                      
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-200 text-surface-800 dark:bg-surface-700 dark:text-surface-300">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Due: {task.dueDate}
                      </span>
                      
                      {task.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 self-end md:self-center">
                    <motion.button
                      onClick={() => openModal(task)}
                      className="p-2 rounded-full text-surface-600 hover:text-primary hover:bg-surface-200 dark:text-surface-400 dark:hover:text-primary-light dark:hover:bg-surface-700"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Edit task"
                    >
                      <EditIcon className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-full text-surface-600 hover:text-red-500 hover:bg-red-100 dark:text-surface-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Delete task"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card flex flex-col items-center justify-center py-10 text-center"
            >
              <InfoIcon className="w-12 h-12 text-surface-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No tasks found</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-6 max-w-md">
                {searchQuery 
                  ? "No tasks match your search criteria. Try adjusting your search or filters." 
                  : activeTab === 'completed' 
                    ? "You haven't completed any tasks yet. Mark tasks as completed to see them here."
                    : "You have no tasks. Add your first task to get started!"}
              </p>
              {!searchQuery && (
                <motion.button
                  onClick={() => openModal()}
                  className="btn btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Your First Task</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeModal}
              ></motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft max-w-lg w-full relative z-10 overflow-hidden"
              >
                <div className="p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="What needs to be done?"
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add details about your task..."
                      rows="3"
                      className="input-field resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas"
                      className="input-field"
                    />
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                      Example: Work, Personal, Urgent
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    
                    <motion.button
                      type="submit"
                      className="btn btn-primary flex items-center gap-2"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <SaveIcon className="w-4 h-4" />
                      <span>{editingTask ? "Update Task" : "Create Task"}</span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainFeature;