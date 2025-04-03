import * as React from "react"
import { motion } from "framer-motion"

const QuickLoginButtons = ({ onQuickLogin }) => {
  return (
    <div className="mb-6">
      <p className="text-sm text-blue-300 mb-3 text-center">Connexion rapide (Dev only)</p>
      <div className="grid grid-cols-3 gap-2 mb-4 max-w-[500px] mx-auto">
        <motion.button
          type="button"
          onClick={() => onQuickLogin('admin')}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600/80 rounded-md hover:bg-blue-600 border border-blue-500/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Admin
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onQuickLogin('superadmin')}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600/80 rounded-md hover:bg-red-600 border border-red-500/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Superadmin
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onQuickLogin('recruiter')}
          className="px-3 py-2 text-sm font-medium text-white bg-pink-600/80 rounded-md hover:bg-pink-600 border border-pink-500/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Recruiter
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onQuickLogin('teacher')}
          className="px-3 py-2 text-sm font-medium text-white bg-green-600/80 rounded-md hover:bg-green-600 border border-green-500/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Teacher
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onQuickLogin('student')}
          className="px-3 py-2 text-sm font-medium text-white bg-yellow-600/80 rounded-md hover:bg-yellow-600 border border-yellow-500/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Student
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onQuickLogin('hr')}
          className="px-3 py-2 text-sm font-medium text-white bg-purple-600/80 rounded-md hover:bg-purple-600 border border-purple-500/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          HR
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onQuickLogin('guest')}
          className="col-start-2 px-3 py-2 text-sm font-medium text-white bg-gray-600/80 rounded-md hover:bg-gray-600 border border-gray-500/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Guest
        </motion.button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-400 bg-gray-900">
            Ou connectez-vous manuellement
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuickLoginButtons