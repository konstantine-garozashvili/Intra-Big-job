import * as React from "react"
import { Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { authService } from "@/lib/services/authService"
import { toast } from "sonner"

export function AuthForm() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const navigate = useNavigate()

  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@bigproject.com', password: 'Password123@' },
      superadmin: { email: 'superadmin@bigproject.com', password: 'Password123@' },
      teacher: { email: 'teacher@bigproject.com', password: 'Password123@' },
      student: { email: 'student@bigproject.com', password: 'Password123@' },
      hr: { email: 'hr@bigproject.com', password: 'Password123@' },
      guest: { email: 'guest@bigproject.com', password: 'Password123@' }
    }

    if (credentials[role]) {
      setEmail(credentials[role].email)
      setPassword(credentials[role].password)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setErrors({})
    
    // Validation basique
    const newErrors = {}
    if (!email) newErrors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Format d'email invalide"
    if (!password) newErrors.password = "Le mot de passe est requis"
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await authService.login(email, password)
      
      // Si rememberMe est activé, stocker l'email dans localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      toast.success("Connexion réussie", {
        description: "Vous êtes maintenant connecté."
      })

      // Store user roles in localStorage
      if (response.roles) {
        localStorage.setItem('userRoles', JSON.stringify(response.roles));
      }
      
      // Vérifier s'il y a une page de redirection stockée
      const returnTo = sessionStorage.getItem('returnTo')
      
      // Rediriger vers la page stockée ou le profil
      if (returnTo) {
        sessionStorage.removeItem('returnTo')
        navigate(returnTo)
      } else {
        navigate('/profil')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({
        submit: error.message || "Une erreur est survenue lors de la connexion."
      })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Connexion
        </h2>
        <p className="text-sm text-gray-600">
          Accédez à votre espace <span className="font-bold text-[#02284f]">Big<span className="text-[#528eb2]">Project</span></span>
        </p>
      </div>

      {/* Quick Login Buttons */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2 text-center">Connexion rapide (Dev only)</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => quickLogin('admin')}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => quickLogin('superadmin')}
            className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Superadmin
          </button>
          <button
            type="button"
            onClick={() => quickLogin('teacher')}
            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => quickLogin('student')}
            className="px-3 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => quickLogin('hr')}
            className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            HR
          </button>
          <button
            type="button"
            onClick={() => quickLogin('guest')}
            className="px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            Guest
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#528eb2] focus:border-[#528eb2] sm:text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#528eb2] focus:border-[#528eb2] sm:text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-[#528eb2] focus:ring-[#528eb2] border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-[#528eb2] hover:text-[#02284f]">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erreur de connexion
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.submit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#02284f] hover:bg-[#02284f]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#528eb2] ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Pas encore de compte ?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/register"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#02284f] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#528eb2]"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
} 