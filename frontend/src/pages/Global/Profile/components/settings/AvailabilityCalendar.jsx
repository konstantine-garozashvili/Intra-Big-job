import React, { lazy, Suspense, memo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { studentProfileService } from '@/lib/services';
import 'react-calendar/dist/Calendar.css';
import '@/styles/custom-calendar.css'; // Import du CSS personnalisé pour le calendrier

// Chargement dynamique du calendrier pour améliorer les performances
const Calendar = lazy(() => import('react-calendar'));

// Composant de chargement pour le calendrier - Mémorisé
const CalendarFallback = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-t-2 border-b-2 border-[#0066ff] rounded-full animate-spin"></div>
  </div>
));

CalendarFallback.displayName = 'CalendarFallback';

// Composant principal pour la gestion des disponibilités
const AvailabilityCalendar = memo(({ profile, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(
    profile?.availabilityDate ? new Date(profile.availabilityDate) : null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Formater la date pour l'affichage
  const formattedAvailabilityDate = availabilityDate 
    ? new Intl.DateTimeFormat('fr-FR').format(availabilityDate) 
    : null;

  // Gérer le changement de date
  const handleDateChange = async (date) => {
    setAvailabilityDate(date);
    setCalendarOpen(false);
    
    try {
      setLoading(true);
      
      // Préparer les données à mettre à jour
      const updatedData = {
        availabilityDate: date.toISOString().split('T')[0] // Format YYYY-MM-DD
      };
      
      // Appeler la fonction de mise à jour fournie par le parent
      if (onProfileUpdate) {
        await onProfileUpdate(updatedData);
        toast.success("Date de disponibilité mise à jour avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la date de disponibilité:", error);
      toast.error("Erreur lors de la mise à jour de la date de disponibilité");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-sm sm:text-base text-gray-600">
        Indiquez votre date de disponibilité pour que les recruteurs sachent quand vous êtes disponible pour commencer un stage ou une alternance.
      </p>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date de disponibilité
        </label>
        <div className="relative">
          <div 
            className={`w-full px-4 py-3 rounded-md border flex items-center cursor-pointer transition-colors hover:border-[#0066ff] ${loading ? 'opacity-70' : ''} border-gray-300`}
            onClick={() => !loading && setCalendarOpen(true)}
          >
            {formattedAvailabilityDate ? (
              <span className="text-gray-900">
                {formattedAvailabilityDate}
              </span>
            ) : (
              <span className="text-gray-500">Sélectionnez une date</span>
            )}
            <CalendarIcon className="ml-auto h-5 w-5 text-gray-500" />
          </div>
          
          <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
            <DialogContent className="p-0 sm:max-w-[425px] bg-white rounded-lg shadow-xl border-none overflow-hidden">
              <div className="p-4 pb-0">
                <DialogTitle className="text-xl font-semibold text-center text-gray-900">
                  Sélectionnez votre date de disponibilité
                </DialogTitle>
                <p className="text-sm text-center text-gray-500 mt-1">
                  À partir de quand êtes-vous disponible pour un stage ou une alternance?
                </p>
              </div>
              <div className="calendar-container w-full p-4">
                <Suspense fallback={<CalendarFallback />}>
                  <Calendar 
                    onChange={handleDateChange} 
                    value={availabilityDate} 
                    locale="fr"
                    minDate={new Date()} // Date minimum = aujourd'hui
                    minDetail="month" 
                    defaultView="month"
                    className="modern-calendar w-full"
                    formatShortWeekday={(locale, date) => ['L', 'M', 'M', 'J', 'V', 'S', 'D'][date.getDay()]}
                    navigationLabel={({ date }) => 
                      date.toLocaleString('fr', { month: 'long', year: 'numeric' }).toLowerCase()
                    }
                    next2Label={<span className="text-lg text-[#0066ff]">»</span>}
                    prev2Label={<span className="text-lg text-[#0066ff]">«</span>}
                    nextLabel={<span className="text-lg text-[#0066ff]">›</span>}
                    prevLabel={<span className="text-lg text-[#0066ff]">‹</span>}
                    showNeighboringMonth={false}
                  />
                </Suspense>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {availabilityDate && (
          <p className="mt-2 text-sm text-green-600">
            Vous serez disponible à partir du {formattedAvailabilityDate}.
          </p>
        )}
      </div>
    </div>
  );
});

// Ajouter un displayName pour faciliter le débogage
AvailabilityCalendar.displayName = 'AvailabilityCalendar';

export default AvailabilityCalendar; 