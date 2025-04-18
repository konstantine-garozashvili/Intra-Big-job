import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"

const QuickLoginButtons = ({ onQuickLogin }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  
  const roles = [
    //{ id: 'admin', label: 'Admin', color: 'blue' },
    //{ id: 'superadmin', label: 'Superadmin', color: 'red' }, 
    { id: 'recruiter', label: 'Recruiter', color: 'pink' },
    { id: 'teacher', label: 'Teacher', color: 'green' },
    { id: 'student', label: 'Student', color: 'yellow' },
    { id: 'hr', label: 'HR', color: 'purple' },
    { id: 'guest', label: 'Guest', color: 'gray' }
  ];

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-600/80 hover:bg-blue-600 border-blue-500/30",
      red: "bg-red-600/80 hover:bg-red-600 border-red-500/30",
      pink: "bg-pink-600/80 hover:bg-pink-600 border-pink-500/30",
      green: "bg-green-600/80 hover:bg-green-600 border-green-500/30",
      yellow: "bg-yellow-600/80 hover:bg-yellow-600 border-yellow-500/30",
      purple: "bg-purple-600/80 hover:bg-purple-600 border-purple-500/30",
      gray: "bg-gray-600/80 hover:bg-gray-600 border-gray-500/30"
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
      {/* Composant principal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="bg-gray-900/90 backdrop-blur-md p-4 rounded-lg border border-blue-500/30 shadow-2xl mb-2 overflow-hidden"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <p className="text-sm text-blue-300 text-center font-medium mb-3">Dev Quick Login</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  type="button"
                  onClick={() => onQuickLogin(role.id)}
                  className={`px-3 py-2 text-sm font-medium text-white ${getColorClasses(role.color)} rounded-md backdrop-blur-sm border`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {role.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton de toggle */}
      <motion.button
        className="bg-gray-900/90 backdrop-blur-md text-blue-300 p-3 rounded-full border border-blue-500/30 shadow-lg flex items-center justify-center"
        onClick={toggleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
      >
        {isOpen ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
        <span className="ml-2 font-medium text-sm">
          {isOpen ? "Fermer" : "Login"}
        </span>
      </motion.button>
    </div>
  );
};

export default QuickLoginButtons 
