import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Loader2, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../lib/services/authService';
import { useRoles } from '@/features/roles/roleContext';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import apiService from '@/lib/services/apiService';

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
    
    // Fonction modifiée pour récupérer les signatures depuis la base de données via l'API
    const checkTodaySignatures = async () => {
      try {
        setIsLoading(true);
        console.log('Vérification des signatures du jour - démarrage de la requête API');
        
        try {
          console.log('Récupération des données de signature depuis l\'API...');
          
          // Utiliser apiService pour récupérer les données depuis le backend
          const data = await apiService.get('/signatures/today');
          
          console.log('Données de signature retournées par l\'API:', data);
          
          // Définir les données même si elles sont partielles
          if (data) {
            if (data.currentPeriod) {
              console.log('Définition de la période actuelle:', data.currentPeriod);
              setCurrentPeriod(data.currentPeriod);
            }
            
            if (data.signedPeriods) {
              console.log('Définition des périodes signées:', data.signedPeriods);
              setSignedPeriods(data.signedPeriods || []);
            }
            
            if (data.availablePeriods) {
              console.log('Définition des périodes disponibles:', data.availablePeriods);
              setAvailablePeriods(data.availablePeriods);
            }
          } else {
            // Valeurs par défaut
            setCurrentPeriod('afternoon'); // Par défaut à l'après-midi
            setSignedPeriods([]);
            setAvailablePeriods({
              morning: 'Matin (9h-12h)',
              afternoon: 'Après-midi (13h-17h)'
            });
          }
        } catch (error) {
          console.error('Erreur lors de la vérification des signatures du jour:', error);
          
          // Valeurs par défaut en cas d'erreur
          setCurrentPeriod('afternoon');
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
        console.error('Erreur lors de la configuration des signatures:', error);
        setIsLoading(false);
        
        // Valeurs par défaut
        setCurrentPeriod('afternoon');
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
  
  // Submit signature - Modification pour ne pas mettre à jour l'état local mais recharger depuis l'API
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
      console.log(`Taille des données de signature: ${signatureData.length} caractères`);
      
      // Préparer les données de la requête
      const requestData = {
        location,
        drawing: signatureData
      };
      
      console.log('Envoi de la requête de signature avec les données:', requestData);
      
      // Envoyer la requête API au backend
      console.log('Envoi de la requête API au backend');
      
      // Utiliser apiService pour envoyer les données au backend
      const response = await apiService.post('/signatures', requestData);
      
      console.log('Signature créée avec succès:', response.data);
      
      // Clear the signature
      clearSignature();
      
      // Afficher un message de succès
      toast.success("Succès", {
        description: `Signature enregistrée pour la période ${availablePeriods[currentPeriod]}.`
      });
      
      // Recharger les données depuis le backend au lieu de mettre à jour localement
      await checkTodaySignatures();
      
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      if (userRoles.includes('ROLE_TEACHER')) {
        navigate('/teacher/dashboard');
      } else if (userRoles.includes('ROLE_STUDENT')) {
        navigate('/student/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la signature:', error);
      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue lors de la soumission de la signature."
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
