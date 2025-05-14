import { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TaskList from '../components/TaskList';
import getIcon from '../utils/iconUtils';
import { AuthContext } from '../App';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { logout } = useContext(AuthContext);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Icons declaration
  const CheckCircleIcon = getIcon('CheckCircle');
  const ClockIcon = getIcon('Clock');
  const CheckCircle2Icon = getIcon('CheckCircle2');
  const LayoutDashboardIcon = getIcon('LayoutDashboard');
  const LogOutIcon = getIcon('LogOut');
  const UserIcon = getIcon('User');
  
  const tabs = [
    { id: 'all', name: 'All Tasks', icon: LayoutDashboardIcon },
    { id: 'pending', name: 'Pending', icon: ClockIcon },
    { id: 'completed', name: 'Completed', icon: CheckCircleIcon }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-40 px-4 py-4 mb-6 shadow-sm border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="w-8 h-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          
          <div className="hidden md:flex">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300
                      ${activeTab === tab.id 
                        ? 'text-primary font-medium' 
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                      }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-surface-600 dark:text-surface-400 hidden md:flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>{user?.firstName || 'User'}</span>
            </div>
            
            <motion.button
              onClick={handleLogout}
              className="p-2 rounded-full text-surface-600 hover:text-red-500 hover:bg-red-100 dark:text-surface-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Log out"
            >
              <LogOutIcon className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="md:hidden flex space-x-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative p-2 rounded-lg transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'text-primary' 
                      : 'text-surface-600 dark:text-surface-400'
                    }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-surface-800 dark:text-surface-100">
              {activeTab === 'all' ? 'All Tasks' : 
               activeTab === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mt-2">
              {activeTab === 'all' ? 'Manage all your tasks in one place' : 
               activeTab === 'pending' ? 'Tasks that need your attention' : 'Tasks you\'ve completed'}
            </p>
          </div>
          
          {/* Main feature component */}
          <TaskList activeTab={activeTab} />
        </motion.div>
      </main>
    </div>
  );
}

export default Dashboard;