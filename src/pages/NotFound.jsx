import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function NotFound() {
  const HomeIcon = getIcon('Home');
  const AlertTriangleIcon = getIcon('AlertTriangle');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full text-center card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
            <AlertTriangleIcon className="w-12 h-12 text-accent" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <Link 
          to="/"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;