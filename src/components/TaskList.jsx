import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import getIcon from '../utils/iconUtils';
import { fetchTasksAction, createTaskAction, updateTaskAction, deleteTaskAction } from '../store/taskSlice';

function TaskList({ activeTab }) {
  const dispatch = useDispatch();
  const { items: tasks, status, error } = useSelector(state => state.tasks);
  
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
  const LoaderIcon = getIcon('Loader2');

  // State declarations
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

  // Load tasks when component mounts or filters change
  useEffect(() => {
    // Set filter based on active tab
    const filter = {};
    if (activeTab === 'pending') {
      filter.completed = false;
    } else if (activeTab === 'completed') {
      filter.completed = true;
    }
    
    dispatch(fetchTasksAction({ filter, searchQuery, priorityFilter }));
  }, [dispatch, activeTab, searchQuery, priorityFilter]);
  
  // Show error toast if task operations fail
  useEffect(() => {
    if (error) {
      toast.error(`Operation failed: ${error}`);
    }
  }, [error]);

  // Form handling functions
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Not Started',
        dueDate: task.dueDate || format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd'),
        tags: task.Tags ? task.Tags.join(', ') : ''
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

  const handleSubmit = async (e) => {
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

    try {
      if (editingTask) {
        // Update existing task
        await dispatch(updateTaskAction({ 
          id: editingTask.Id, 
          taskData 
        })).unwrap();
        
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        await dispatch(createTaskAction(taskData)).unwrap();
        
        toast.success("Task created successfully!");
      }
      
      closeModal();
      
      // Refresh task list
      const filter = {};
      if (activeTab === 'pending') {
        filter.completed = false;
      } else if (activeTab === 'completed') {
        filter.completed = true;
      }
      
      dispatch(fetchTasksAction({ filter, searchQuery, priorityFilter }));
    } catch (err) {
      toast.error(`Failed to ${editingTask ? 'update' : 'create'} task: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteTask = async (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await dispatch(deleteTaskAction(id)).unwrap();
        toast.success("Task deleted successfully!");
      } catch (err) {
        toast.error(`Failed to delete task: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
      
      await dispatch(updateTaskAction({ 
        id: task.Id, 
        taskData: { 
          status: newStatus,
          completedAt: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
        } 
      })).unwrap();
      
      toast.info(`Task marked as ${newStatus}`);
    } catch (err) {
      toast.error(`Failed to update task status: ${err.message || 'Unknown error'}`);
    }
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColorClasses[priority] || priorityColorClasses.Medium}`}>
        <FlagIcon className="w-3 h-3 mr-1" />
        {priority || 'Medium'}
      </span>
    );
  };

  const getStatusLabel = (status) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClasses[status] || statusColorClasses["Not Started"]}`}>
        {status === "Completed" ? <CheckIcon className="w-3 h-3 mr-1" /> : null}
        {status || 'Not Started'}
      </span>
    );
  };

  // Loading state
  if (status === 'loading' && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
        <LoaderIcon className="w-10 h-10 text-primary animate-spin" />
        <span className="ml-2 text-lg text-surface-600 dark:text-surface-400">Loading tasks...</span>
      </div>
    );
  }

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
            className="input-field pl-10 w-full rounded-lg border border-surface-300 dark:border-surface-600 
                       bg-white dark:bg-surface-800 px-4 py-2 text-surface-800 dark:text-surface-100 
                       focus:border-primary dark:focus:border-primary-light focus:outline-none focus:ring-1 
                       focus:ring-primary dark:focus:ring-primary-light"
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
              className="input-field pl-9 pr-8 py-2 appearance-none rounded-lg border border-surface-300 
                        dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 
                        dark:text-surface-100 focus:border-primary dark:focus:border-primary-light 
                        focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-light"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <motion.button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center gap-2 bg-primary hover:bg-primary-dark text-white 
                     font-medium py-2 px-4 rounded-lg transition-colors"
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
          {status === 'loading' && tasks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 flex justify-center"
            >
              <LoaderIcon className="w-8 h-8 text-primary animate-spin" />
            </motion.div>
          )}
          
          {status !== 'loading' && tasks.length > 0 ? (
            tasks.map(task => (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 
                          rounded-xl shadow-soft hover:shadow-card transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
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
                    <h3 className={`text-lg font-medium ${task.status === 'Completed' ? 'line-through text-surface-500 dark:text-surface-400' : 'text-surface-800 dark:text-surface-100'}`}>
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
                      
                      {task.dueDate && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-200 text-surface-800 dark:bg-surface-700 dark:text-surface-300">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          Due: {task.dueDate}
                        </span>
                      )}
                      
                      {task.Tags && task.Tags.map(tag => (
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
                      onClick={() => handleDeleteTask(task.Id)}
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
            status !== 'loading' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 
                          rounded-xl shadow-soft flex flex-col items-center justify-center text-center"
              >
                <InfoIcon className="w-12 h-12 text-surface-400 mb-4" />
                <h3 className="text-xl font-medium mb-2 text-surface-800 dark:text-surface-100">No tasks found</h3>
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
                    className="btn btn-primary flex items-center gap-2 bg-primary hover:bg-primary-dark text-white 
                              font-medium py-2 px-4 rounded-lg transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Your First Task</span>
                  </motion.button>
                )}
              </motion.div>
            )
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
                  <h2 className="text-xl font-semibold text-surface-800 dark:text-surface-100">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    <XIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-800 dark:text-surface-200">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="What needs to be done?"
                      className="w-full rounded-lg border border-surface-300 dark:border-surface-600 
                                bg-white dark:bg-surface-800 px-4 py-2 text-surface-800 dark:text-surface-100 
                                focus:border-primary dark:focus:border-primary-light focus:outline-none focus:ring-1 
                                focus:ring-primary dark:focus:ring-primary-light"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-800 dark:text-surface-200">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add details about your task..."
                      rows="3"
                      className="w-full rounded-lg border border-surface-300 dark:border-surface-600 
                                bg-white dark:bg-surface-800 px-4 py-2 text-surface-800 dark:text-surface-100 
                                focus:border-primary dark:focus:border-primary-light focus:outline-none focus:ring-1 
                                focus:ring-primary dark:focus:ring-primary-light resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-surface-800 dark:text-surface-200">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-surface-300 dark:border-surface-600 
                                 bg-white dark:bg-surface-800 px-4 py-2 text-surface-800 dark:text-surface-100 
                                 focus:border-primary dark:focus:border-primary-light focus:outline-none focus:ring-1 
                                 focus:ring-primary dark:focus:ring-primary-light"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-surface-800 dark:text-surface-200">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-surface-300 dark:border-surface-600 
                                 bg-white dark:bg-surface-800 px-4 py-2 text-surface-800 dark:text-surface-100 
                                 focus:border-primary dark:focus:border-primary-light focus:outline-none focus:ring-1 
                                 focus:ring-primary dark:focus:ring-primary-light"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-800 dark:text-surface-200">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-surface-300 dark:border-surface-600 
                               bg-white dark:bg-surface-800 px-4 py-2 text-surface-800 dark:text-surface-100 
                               focus:border-primary dark:focus:border-primary-light focus:outline-none focus:ring-1 
                               focus:ring-primary dark:focus:ring-primary-light"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-800 dark:text-surface-200">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas"
                      className="w-full rounded-lg border border-surface-300 dark:border-surface-600 
                               bg-white dark:bg-surface-800 px-4 py-2 text-surface-800 dark:text-surface-100 
                               focus:border-primary dark:focus:border-primary-light focus:outline-none focus:ring-1 
                               focus:ring-primary dark:focus:ring-primary-light"
                    />
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                      Example: Work, Personal, Urgent
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-surface-300 dark:border-surface-600 
                               rounded-lg text-surface-800 dark:text-surface-200 hover:bg-surface-100 
                               dark:hover:bg-surface-700 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <motion.button
                      type="submit"
                      className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white 
                               font-medium py-2 px-4 rounded-lg transition-colors"
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

export default TaskList;