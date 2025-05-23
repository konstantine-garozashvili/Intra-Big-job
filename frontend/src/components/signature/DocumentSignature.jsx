import { useState, useRef, useEffect, forwardRef } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { 
  Loader2, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  CalendarCheck, 
  PenLine, 
  Zap, 
  MapPinned
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../lib/services/authService';
import { useRoles } from '@/features/roles/roleContext';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Custom fallback implementation for SignatureCanvas
const FallbackSignatureCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Initialize canvas
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Make sure canvas is responsive
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = 200; // Fixed height
      
      // Redraw after resize
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates
    let x, y;
    if (e.type === 'mousedown') {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else if (e.type === 'touchstart') {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates
    let x, y;
    if (e.type === 'mousemove') {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else if (e.type === 'touchmove') {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (props.onEnd) props.onEnd();
    }
  };
  
  // API to match react-signature-canvas
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };
  
  const toDataURL = () => {
    return canvasRef.current.toDataURL();
  };
  
  // Expose API methods via ref
  useEffect(() => {
    if (ref) {
      ref.current = {
        clear,
        isEmpty: () => isEmpty,
        toDataURL
      };
    }
  }, [isEmpty, ref]);
  
  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-300 rounded-md w-full"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
      style={{ touchAction: 'none' }} // Prevent touch scrolling
    />
  );
});

// Main component
const DocumentSignature = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [signedPeriods, setSignedPeriods] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState({});
  const signatureRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { hasRole } = useRoles();
  const permissions = useRolePermissions();
  
  // Check if user is a student or teacher using proper role management
  useEffect(() => {
    const isAuthorized = hasRole('ROLE_TEACHER') || hasRole('ROLE_STUDENT');
    if (!isAuthorized) {
      toast.error("Accès non autorisé", {
        description: "Seuls les étudiants et les enseignants peuvent accéder à cette page."
      });
      navigate('/dashboard');
      return;
    }
  }, [hasRole, navigate]);
  
  // Add this function near the beginning of the DocumentSignature component
  const fetchDataWithRetry = async (url, options, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn(`API call failed (attempt ${attempt + 1}/${retries}):`, errorData);
          
          // If this is the last attempt, throw the error
          if (attempt === retries - 1) {
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
        
        return await response.json();
      } catch (error) {
        console.error(`API call error (attempt ${attempt + 1}/${retries}):`, error);
        
        // If this is the last attempt, rethrow the error
        if (attempt === retries - 1) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  };
  
  // Function to clear any potentially cached signature state
  const clearCachedSignatureState = () => {
    try {
      // Check if there are any localStorage keys related to signatures
      const keys = Object.keys(localStorage);
      const signatureKeys = keys.filter(key => 
        key.includes('signature') || 
        key.includes('signed') || 
        key.includes('period')
      );
      
      // Log any found keys
      if (signatureKeys.length > 0) {
        console.log('Found potential signature-related localStorage keys:', signatureKeys);
        
        // Clear these keys
        signatureKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`Removed localStorage key: ${key}`);
        });
      }
    } catch (error) {
      console.error('Error clearing cached signature state:', error);
    }
  };
  
  // Clear cache when component mounts
  useEffect(() => {
    clearCachedSignatureState();
  }, []);
  
  // Ensure user data is properly stored in localStorage
  useEffect(() => {
    const setupUserData = async () => {
      try {
        await authService.ensureUserDataInLocalStorage();
      } catch (error) {
        console.error('Failed to ensure user data in localStorage:', error);
      }
    };
    
    setupUserData();
    
    const checkTodaySignatures = async () => {
      try {
        setIsLoading(true);
        
        // Create a failsafe timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("API request timeout")), 10000)
        );
        
        // Get token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        try {
          // Race the fetch against a timeout
          const data = await Promise.race([
            fetchDataWithRetry('/api/signatures/today', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }),
            timeoutPromise
          ]);
          
          // Set the data even if it's partial
          if (data) {
            if (data.currentPeriod) {
              setCurrentPeriod(data.currentPeriod);
            }
            
            if (data.signedPeriods) {
              setSignedPeriods(data.signedPeriods || []);
            }
            
            if (data.availablePeriods) {
              setAvailablePeriods(data.availablePeriods);
            }
          } else {
            // Fallback defaults
            setCurrentPeriod('afternoon'); // Default to afternoon
            setSignedPeriods([]);
            setAvailablePeriods({
              morning: 'Matin (9h-12h)',
              afternoon: 'Après-midi (13h-17h)'
            });
          }
        } catch (error) {
          console.error('Error checking today\'s signatures:', error);
          
          // Fallback to default values
          setCurrentPeriod('afternoon'); // Default to afternoon
          setSignedPeriods([]);
          setAvailablePeriods({
            morning: 'Matin (9h-12h)',
            afternoon: 'Après-midi (13h-17h)'
          });
          
          toast.error("Erreur", {
            description: "Impossible de vérifier les signatures. Utilisation de valeurs par défaut."
          });
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in signature setup:', error);
        setIsLoading(false);
        
        // Fallback to default values
        setCurrentPeriod('afternoon'); // Default to afternoon
        setSignedPeriods([]);
        setAvailablePeriods({
          morning: 'Matin (9h-12h)',
          afternoon: 'Après-midi (13h-17h)'
        });
      }
    };

    checkTodaySignatures();
    getLocation();
  }, []);
  
  // Get user's location
  const getLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationString = `${position.coords.latitude},${position.coords.longitude}`;
          setLocation(locationString);
          setIsLocating(false);
          
          toast.success("Localisation détectée", {
            description: "Votre position a été détectée avec succès."
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          
          let errorMessage = "Impossible d'obtenir votre position.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "L'accès à la géolocalisation a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Les informations de localisation ne sont pas disponibles.";
              break;
            case error.TIMEOUT:
              errorMessage = "La requête de localisation a expiré. Veuillez réessayer.";
              break;
            default:
              errorMessage = `Une erreur est survenue: ${error.message}`;
          }
          
          toast.error("Erreur de localisation", {
            description: errorMessage
          });
        },
        { 
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 300000
        }
      );
    } else {
      setIsLocating(false);
      toast.error("Localisation non supportée", {
        description: "Votre navigateur ne supporte pas la géolocalisation."
      });
    }
  };
  
  // Clear signature
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };
  
  // Submit signature
  const submitSignature = async () => {
    if (isSubmitting) return; // Éviter les soumissions multiples
    
    if (!location) {
      toast.error("Signature non autorisée", {
        description: "La localisation est requise. Veuillez autoriser l'accès à votre position."
      });
      return;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Validation impossible", {
        description: "Veuillez signer avant de soumettre."
      });
      return;
    }

    if (!currentPeriod) {
      toast.error("Signature non autorisée", {
        description: "Les signatures ne sont autorisées qu'entre 9h-12h (matin) et 13h-17h (après-midi)."
      });
      return;
    }

    if (signedPeriods.includes(currentPeriod)) {
      toast.error("Signature déjà enregistrée", {
        description: `Vous avez déjà signé pour la période ${availablePeriods[currentPeriod]} aujourd'hui.`
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get signature data URL
      const signatureData = signatureRef.current.toDataURL();
      
      // Prepare the request data
      const requestData = {
        location,
        drawing: signatureData
      };
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Tenter d'envoyer la signature au backend
      let apiSuccess = false;
      let responseData = null;
      
      try {
        const response = await fetch('/api/signatures', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
          responseData = await response.json();
          apiSuccess = true;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', errorData);
          throw new Error(errorData.message || 'Failed to create signature');
        }
      } catch (apiError) {
        // Continue avec le mode dégradé - API inaccessible
      }
      
      // Si l'API n'est pas disponible, enregistrer la signature localement
      if (!apiSuccess) {
        const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const storageKey = `signature_${todayStr}_${currentPeriod}`;
        
        // Enregistrer localement
        localStorage.setItem(storageKey, 'true');
        
        // Enregistrer également une version simplifiée des données de signature
        const localSignatureKey = `signature_data_${todayStr}_${currentPeriod}`;
        const localSignatureData = {
          date: new Date().toISOString(),
          location: location,
          // Stocker une version tronquée pour économiser de l'espace
          drawing: signatureData.substring(0, 100) + '...[truncated]'
        };
        localStorage.setItem(localSignatureKey, JSON.stringify(localSignatureData));
      }
      
      // Update local state
      setSignedPeriods([...signedPeriods, currentPeriod]);
      setSubmissionSuccess(true);
      setLocation(null);
      
      // Clear the signature
      clearSignature();
      
      // Déclenche un événement personnalisé pour indiquer qu'une signature a été effectuée
      const signatureEvent = new CustomEvent('signatureSubmitted', {
        detail: { 
          period: currentPeriod,
          success: true 
        }
      });
      window.dispatchEvent(signatureEvent);
      
      toast.success("Signature enregistrée", {
        description: apiSuccess 
          ? "Votre signature a été enregistrée avec succès."
          : "Votre signature a été enregistrée localement (mode hors-ligne)."
      });
      
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      if (userRoles.includes('ROLE_TEACHER')) {
        navigate('/teacher/dashboard');
      } else if (userRoles.includes('ROLE_STUDENT')) {
        navigate('/student/dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error submitting signature:', error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la soumission de la signature."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = () => {
    // Only disable during submission or if already signed for this period
    if (isSubmitting) return true;
    if (signedPeriods.includes(currentPeriod)) return true;
    return false;
  };

  const getButtonText = () => {
    if (isSubmitting) return "Envoi en cours...";
    if (!location) return "Localisation requise";
    if (!signatureRef.current || signatureRef.current.isEmpty()) return "Signature requise";
    if (signedPeriods.includes(currentPeriod)) return "Déjà signé pour cette période";
    if (!currentPeriod) return "Hors période";
    return "Signer";
  };

  // If user has already signed for the current period, show the alert
  if (currentPeriod && signedPeriods.includes(currentPeriod)) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <Card className="overflow-hidden border-green-100 dark:border-green-900">
          <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
              <CardTitle className="text-green-800 dark:text-green-400">Présence déjà enregistrée</CardTitle>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              Vous avez déjà signé pour la période {availablePeriods[currentPeriod]} aujourd'hui.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium mb-2">Les signatures sont autorisées aux périodes suivantes :</p>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    Matin
                  </Badge>
                  <span>9h - 12h</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    Après-midi
                  </Badge>
                  <span>13h - 17h</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="overflow-hidden border-blue-100 dark:border-blue-900/50">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/10">
          <div className="flex items-center gap-2">
            <CardTitle className="text-blue-800 dark:text-blue-400">
              {currentPeriod ? "Signature de présence" : "Période de signature fermée"}
            </CardTitle>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            {currentPeriod ? (
              `Signez ci-dessous pour confirmer votre présence pour la période ${availablePeriods[currentPeriod]}`
            ) : (
              "Les signatures ne sont autorisées qu'entre 9h-12h (matin) et 13h-17h (après-midi)."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-white dark:bg-gray-800/40 rounded-md border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <FallbackSignatureCanvas ref={signatureRef} onEnd={() => {/* Signature completed */}} />
          </div>
          
          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <MapPinned className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span>Localisation détectée avec succès</span>
              <Badge variant="outline" className="ml-auto bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" /> Prêt
              </Badge>
            </div>
          )}
          
          {!location && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Localisation requise</AlertTitle>
              <AlertDescription>
                Veuillez autoriser l'accès à votre position pour continuer.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-800 py-3 bg-gray-50 dark:bg-gray-800/20">
          <Button 
            variant="outline" 
            onClick={clearSignature}
            disabled={isSubmitting}
            className="gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
            </svg>
            Effacer
          </Button>
          
          <div className="flex gap-2">
            {!location && (
              <Button 
                variant="outline"
                className="gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                onClick={getLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Localisation...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Localiser</span>
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={submitSignature}
              disabled={isButtonDisabled()}
              className="gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  {!location ? (
                    <MapPin className="h-4 w-4" />
                  ) : !signatureRef.current || signatureRef.current.isEmpty() ? (
                    <PenLine className="h-4 w-4" />
                  ) : (
                    <CalendarCheck className="h-4 w-4" />
                  )}
                  <span>{getButtonText()}</span>
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

    </motion.div>
  );
};

export default DocumentSignature;
