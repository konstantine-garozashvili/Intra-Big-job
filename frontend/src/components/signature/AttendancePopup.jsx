import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DocumentSignature from './DocumentSignature';

// Create global state to control the popup visibility
let showPopupCallback = null;
let closePopupCallback = null;

// Function to show the popup from anywhere in the app
export const showAttendancePopup = () => {
  if (showPopupCallback) {
    showPopupCallback(true);
  }
};

// Function to close the popup from anywhere in the app
export const closeAttendancePopup = () => {
  if (closePopupCallback) {
    closePopupCallback();
  }
};

// Make the close function available globally for the DocumentSignature component
window.closeAttendancePopup = closeAttendancePopup;

const AttendancePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Register the callbacks
  useEffect(() => {
    showPopupCallback = setIsOpen;
    closePopupCallback = () => setIsOpen(false);
    
    // Cleanup
    return () => {
      if (showPopupCallback === setIsOpen) {
        showPopupCallback = null;
      }
      if (closePopupCallback === setIsOpen) {
        closePopupCallback = null;
      }
    };
  }, []);

  // Listen for login success event
  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log("Login success event received");
      // Check if the user is a student
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      if (userRoles.includes('ROLE_STUDENT')) {
        console.log("User is a student, checking daily signature");
        // Check if the user has already signed in today
        const checkDailySignature = async () => {
          try {
            // Get the current date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            
            // Check if we've already shown the popup today
            const lastPopupDate = localStorage.getItem('lastSignaturePopupDate');
            console.log("Last popup date:", lastPopupDate, "Today:", today);
            
            // If we haven't shown the popup today, show it
            if (lastPopupDate !== today) {
              console.log("Showing popup for today");
              // Check if the user has already signed in today
              try {
                const token = localStorage.getItem('token');
                if (!token) {
                  console.error("No token found");
                  return;
                }
                
                const response = await fetch('/api/signatures/today', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (response.ok) {
                  const data = await response.json();
                  console.log("API response:", data);
                  
                  // If the user hasn't signed in today, show the popup
                  if (!data.hasSigned) {
                    console.log("User hasn't signed in today, showing popup");
                    setIsOpen(true);
                  } else {
                    console.log("User has already signed in today");
                  }
                } else {
                  console.error("API error:", response.status);
                  // If there's an error, we'll show the popup anyway
                  setIsOpen(true);
                }
              } catch (error) {
                console.error("Error checking signature:", error);
                // If there's an error, show the popup anyway
                setIsOpen(true);
              }
              
              // Remember that we've shown the popup today
              localStorage.setItem('lastSignaturePopupDate', today);
            } else {
              console.log("Popup already shown today");
            }
          } catch (error) {
            console.error('Error checking daily signature:', error);
          }
        };

        // Wait a moment to ensure token is available
        setTimeout(checkDailySignature, 1000);
      }
    };

    // Add event listener for login success
    window.addEventListener('login-success', handleLoginSuccess);
    
    // Check immediately if we should show the popup (for page refresh cases)
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    if (userRoles.includes('ROLE_STUDENT')) {
      const token = localStorage.getItem('token');
      if (token) {
        // Simulate login success event
        handleLoginSuccess();
      }
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-center">Confirmer votre présence</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Veuillez signer pour confirmer votre présence aujourd'hui.
        </p>
        
        <DocumentSignature />
      </div>
    </div>
  );
};

export default AttendancePopup;
