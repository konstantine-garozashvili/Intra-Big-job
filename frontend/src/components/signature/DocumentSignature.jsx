import { useState, useRef, useEffect, forwardRef } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Loader2, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../lib/services/authService';

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
      e.preventDefault(); // Prevent scrolling
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
      e.preventDefault(); // Prevent scrolling
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
  
  // Check if user is a student
  useEffect(() => {
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    if (!userRoles.includes('ROLE_STUDENT')) {
      toast.error("Accès non autorisé", {
        description: "Seuls les étudiants peuvent accéder à cette page."
      });
      navigate('/');
      return;
    }
  }, [navigate]);
  
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
        console.log('Checking today signatures - starting API request');
        
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
          console.log('Fetching signature data from API...');
          
          // Race the fetch against a timeout
          const data = await Promise.race([
            fetchDataWithRetry('http://localhost:8000/api/signatures/today', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }),
            timeoutPromise
          ]);
          
          console.log('Signature data returned from API:', data);
          console.log('Current period from API:', data?.currentPeriod);
          console.log('Signed periods from API:', data?.signedPeriods);
          
          // Set the data even if it's partial
          if (data) {
            if (data.currentPeriod) {
              console.log('Setting current period to:', data.currentPeriod);
              setCurrentPeriod(data.currentPeriod);
            }
            
            if (data.signedPeriods) {
              console.log('Setting signed periods to:', data.signedPeriods);
              setSignedPeriods(data.signedPeriods || []);
            }
            
            if (data.availablePeriods) {
              console.log('Setting available periods to:', data.availablePeriods);
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
          console.log("Location detected:", locationString);
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
    if (!location) {
      toast.error("Erreur", {
        description: "La localisation est requise. Veuillez autoriser l'accès à votre position."
      });
      return;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Erreur", {
        description: "Veuillez signer avant de soumettre."
      });
      return;
    }

    if (!currentPeriod) {
      toast.error("Erreur", {
        description: "Les signatures ne sont autorisées qu'entre 9h-12h (matin) et 13h-17h (après-midi)."
      });
      return;
    }

    if (signedPeriods.includes(currentPeriod)) {
      toast.error("Erreur", {
        description: `Vous avez déjà signé pour la période ${availablePeriods[currentPeriod]} aujourd'hui.`
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get signature data URL
      const signatureData = signatureRef.current.toDataURL();
      console.log(`Signature data size: ${signatureData.length} characters`);
      
      // Prepare the request data
      const requestData = {
        location,
        drawing: signatureData
      };
      
      console.log('Sending signature request with data:', requestData);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Send the actual API request to the backend
      console.log('Sending actual API request to backend');
      
      try {
        const response = await fetch('http://localhost:8000/api/signatures', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create signature');
        }
        
        const data = await response.json();
        console.log('Signature created successfully:', data);
        
        // Update local state
        setSignedPeriods([...signedPeriods, currentPeriod]);
        setSubmissionSuccess(true);
        
        // Clear the signature
        clearSignature();
        
        // Show success message
        toast.success("Succès", {
          description: `Signature enregistrée pour la période ${availablePeriods[currentPeriod]}.`
        });
        
        // Redirect to student dashboard immediately
        navigate('/student/dashboard');
        
      } catch (error) {
        console.error('API request failed:', error);
        toast.error("Erreur", {
          description: error.message || "Une erreur est survenue lors de l'envoi de la signature."
        });
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
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Présence déjà enregistrée</AlertTitle>
          <AlertDescription className="text-green-700">
            Vous avez déjà signé pour la période {availablePeriods[currentPeriod]} aujourd'hui.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Les signatures sont autorisées aux périodes suivantes :</p>
          <ul className="list-disc list-inside mt-2">
            <li>Matin : 9h - 12h</li>
            <li>Après-midi : 13h - 17h</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {currentPeriod ? (
            `Signez ci-dessous pour confirmer votre présence pour la période ${availablePeriods[currentPeriod]}`
          ) : (
            "Les signatures ne sont autorisées qu'entre 9h-12h (matin) et 13h-17h (après-midi)."
          )}
        </p>
        
        <FallbackSignatureCanvas ref={signatureRef} onEnd={() => console.log("Signature completed")} />
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={clearSignature}
            disabled={isSubmitting}  // Only disable during submission
          >
            Effacer
          </Button>
          
          <Button 
            onClick={submitSignature}
            disabled={isButtonDisabled()}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
      
      {/* Location status */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <MapPin className="h-4 w-4 mr-2" />
        {isLocating ? (
          "Détection de la localisation..."
        ) : location ? (
          "Localisation détectée"
        ) : (
          "Localisation non disponible"
        )}
      </div>
    </div>
  );
};

export default DocumentSignature;
