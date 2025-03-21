import * as React from "react"
import { Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { authService } from "@/lib/services/authService"
import { toast } from "sonner"
import { useRolePermissions } from "@/features/roles/useRolePermissions"
import { useRoles } from "@/features/roles/roleContext"
import QuickLoginButtons from './QuickLoginButtons'
import { showGlobalLoader, hideGlobalLoader } from "@/lib/utils/loadingUtils"
import { getPrimaryRole, getDashboardPathByRole } from "@/lib/utils/roleUtils"

// Separate input component to prevent re-renders of the entire form
const FormInput = React.memo(({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  onBlur,
  ...props 
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const actualType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={id}
          type={actualType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#528eb2] focus:border-[#528eb2] sm:text-sm"
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
})

FormInput.displayName = "FormInput"

export function AuthForm() {
  // Use a single form state object to reduce re-renders
  const [formState, setFormState] = React.useState({
    email: "",
    password: "",
    rememberMe: false
  })
  
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const navigate = useNavigate()
  const permissions = useRolePermissions()
  const { refreshRoles } = useRoles()

  // Memoize the credentials object to prevent recreation on each render
  const credentials = React.useMemo(() => ({
    admin: { email: 'admin@bigproject.com', password: 'Password123@' },
    superadmin: { email: 'superadmin@bigproject.com', password: 'Password123@' },
    teacher: { email: 'teacher@bigproject.com', password: 'Password123@' },
    student: { email: 'student@bigproject.com', password: 'Password123@' },
    hr: { email: 'hr@bigproject.com', password: 'Password123@' },
    guest: { email: 'guest@bigproject.com', password: 'Password123@' },
    recruiter: { email: 'recruiter@bigproject.com', password: 'Password123@' }
  }), [])

  const quickLogin = React.useCallback((role) => {
    if (credentials[role]) {
      setFormState(prev => ({
        ...prev,
        email: credentials[role].email,
        password: credentials[role].password
      }))
    }
  }, [credentials])

  // Handle input changes with a single handler
  const handleInputChange = React.useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setErrors({})
    
    // Validation basique
    const newErrors = {}
    if (!formState.email) newErrors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = "Format d'email invalide"
    if (!formState.password) newErrors.password = "Le mot de passe est requis"
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    
    try {
      // Show global loading state with higher priority
      showGlobalLoader()
      
      const response = await authService.login(formState.email, formState.password)
      
      if (formState.rememberMe) {
        localStorage.setItem('rememberedEmail', formState.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      // Nettoyer le cache des rôles pour s'assurer d'avoir les bons rôles
      authService.clearRoleCache();
      
      // Dispatch login success event
      window.dispatchEvent(new Event('login-success'))
      
      // Get the return URL if it exists
      const returnTo = sessionStorage.getItem('returnTo')
      
      // Add small delay before navigation - REDUCED from 300ms to 150ms
      setTimeout(() => {
        if (returnTo) {
          sessionStorage.removeItem('returnTo')
          navigate(returnTo)
        } else {
          // Get role from token directly to determine dashboard path
          const token = localStorage.getItem('token')
          let dashboardPath = '/dashboard'
          
          if (token) {
            try {
              const tokenParts = token.split('.')
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]))
                if (payload.roles && payload.roles.length > 0) {
                  // Importer les fonctions utilitaires de gestion des rôles
                  import('@/lib/utils/roleUtils').then(({ getPrimaryRole, getDashboardPathByRole }) => {
                    // Déterminer le rôle principal selon l'ordre de priorité
                    const primaryRole = getPrimaryRole(payload.roles);
                    // Obtenir le chemin du dashboard en fonction du rôle principal
                    dashboardPath = getDashboardPathByRole(primaryRole);
                    // Naviguer vers le dashboard spécifique au rôle
                    navigate(dashboardPath);
                  }).catch(() => {
                    // Fallback en cas d'erreur d'importation
                    console.error('Erreur lors de l\'importation des utilitaires de rôle, utilisation de la redirection par défaut');
                    navigate(dashboardPath);
                  });
                  return; // Sortir pour éviter la double navigation
                }
              }
            } catch (error) {
              console.error('Error parsing token:', error)
            }
          }
          
          // Cas de fallback si l'importation dynamique échoue ou si aucun rôle n'est trouvé
          navigate(dashboardPath)
        }
        
        // Show success toast after navigation
        toast.success("Connexion réussie")
      }, 150)
      
      // Listen for when full user data is loaded
      const handleUserDataLoaded = () => {
        refreshRoles()
        window.removeEventListener('user-data-loaded', handleUserDataLoaded)
        // Loading will be handled by global loading utilities now
      }
      
      window.addEventListener('user-data-loaded', handleUserDataLoaded)
      
    } catch (error) {
      // Remove loading state on error after a brief delay
      setTimeout(() => {
        hideGlobalLoader()
      }, 200)
      
      if (error.response) {
        const { data } = error.response
        
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setErrors({ email: 'Email non vérifié' })
          
          toast.error("Email non vérifié", {
            description: "Veuillez vérifier votre email avant de vous connecter.",
            action: {
              label: "Renvoyer l'email",
              onClick: () => navigate('/verification-error')
            },
            duration: 5000
          })
        } else if (data.message) {
          setErrors({ auth: data.message })
          toast.error("Erreur de connexion", {
            description: data.message
          })
        } else {
          setErrors({ auth: "Une erreur est survenue lors de la connexion. Veuillez réessayer." })
          toast.error("Erreur de connexion", {
            description: "Une erreur est survenue lors de la connexion. Veuillez réessayer."
          })
        }
      } else {
        setErrors({ auth: "Une erreur est survenue lors de la connexion. Veuillez réessayer." })
        toast.error("Erreur de connexion", {
          description: "Une erreur est survenue lors de la connexion. Veuillez réessayer."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Charger l'email mémorisé au chargement du composant
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setFormState(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }))
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

      {/* Use QuickLoginButtons component */}
      <QuickLoginButtons onQuickLogin={quickLogin} />

      {errors.auth && (
        <div className="p-3 mb-5 text-red-700 bg-red-100 border border-red-400 rounded">
          {errors.auth}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormInput
          id="email"
          name="email"
          label="Adresse email"
          type="email"
          autoComplete="email"
          required
          value={formState.email}
          onChange={handleInputChange}
          error={errors.email}
        />

        <FormInput
          id="password"
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={formState.password}
          onChange={handleInputChange}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formState.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#528eb2] focus:ring-[#528eb2] border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="block ml-2 text-sm text-gray-700">
              Se souvenir de moi
            </label>
          </div>

          <div className="text-sm">
            <Link to="/reset-password" className="font-medium text-[#528eb2] hover:text-[#02284f]">
              Mot de passe oublié?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#528eb2] hover:bg-[#528eb2]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#528eb2] transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">
              Vous n'avez pas encore de compte?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/register"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#528eb2]"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  )
} 