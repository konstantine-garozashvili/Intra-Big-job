import * as React from "react"

const QuickLoginButtons = ({ onQuickLogin }) => {
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-600 mb-2 text-center">Connexion rapide (Dev only)</p>
      <div className="grid grid-cols-3 gap-2 mb-4 max-w-[500px] mx-auto">
        <button
          type="button"
          onClick={() => onQuickLogin('admin')}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => onQuickLogin('superadmin')}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Superadmin
        </button>
        <button
          type="button"
          onClick={() => onQuickLogin('recruiter')}
          className="px-3 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          Recruiter
        </button>
        <button
          type="button"
          onClick={() => onQuickLogin('teacher')}
          className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Teacher
        </button>
        <button
          type="button"
          onClick={() => onQuickLogin('student')}
          className="px-3 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => onQuickLogin('hr')}
          className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
        >
          HR
        </button>
        <button
          type="button"
          onClick={() => onQuickLogin('guest')}
          className="col-start-2 px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
        >
          Guest
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">
            Ou connectez-vous manuellement
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuickLoginButtons 