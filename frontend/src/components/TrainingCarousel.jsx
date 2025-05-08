import React, { useState, useEffect, useContext } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronRight, Clock, Users, ArrowRight, Calendar, MapPin, InfoIcon, Lock } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { formationService } from "@/services/formation.service";
import { MagicButton } from "@/components/ui/magic-button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { ProfileContext } from "@/components/MainLayout";
import { useNotifications } from '@/lib/hooks/useNotifications';
import { formationNotifications } from '@/lib/utils/formationNotifications';

// Configuration des badges avec des couleurs plus inspirantes
const badgeVariants = {
  "Développement Web": "bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900 dark:via-yellow-900 dark:to-orange-900 text-amber-800 dark:text-amber-200 hover:from-amber-200 hover:via-yellow-200 hover:to-orange-200 dark:hover:from-amber-800 dark:hover:via-yellow-800 dark:hover:to-orange-800",
  "Data Science": "bg-gradient-to-r from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900 text-blue-700 dark:text-blue-300 hover:from-blue-200 hover:via-cyan-200 hover:to-teal-200 dark:hover:from-blue-800 dark:hover:via-cyan-800 dark:hover:to-teal-800",
  "Cybersécurité": "bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900 text-violet-700 dark:text-violet-300 hover:from-violet-200 hover:via-purple-200 hover:to-fuchsia-200 dark:hover:from-violet-800 dark:hover:via-purple-800 dark:hover:to-fuchsia-800",
  "DevOps": "bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-900 dark:via-amber-900 dark:to-yellow-900 text-orange-700 dark:text-orange-300 hover:from-orange-200 hover:via-amber-200 hover:to-yellow-200 dark:hover:from-orange-800 dark:hover:via-amber-800 dark:hover:to-yellow-800",
  "IA": "bg-gradient-to-r from-indigo-100 via-blue-100 to-sky-100 dark:from-indigo-900 dark:via-blue-900 dark:to-sky-900 text-indigo-700 dark:text-indigo-300 hover:from-indigo-200 hover:via-blue-200 hover:to-sky-200 dark:hover:from-indigo-800 dark:hover:via-blue-800 dark:hover:to-sky-800",
  "Cloud Computing": "bg-gradient-to-r from-sky-100 via-cyan-100 to-blue-100 dark:from-sky-900 dark:via-cyan-900 dark:to-blue-900 text-sky-700 dark:text-sky-300 hover:from-sky-200 hover:via-cyan-200 hover:to-blue-200 dark:hover:from-sky-800 dark:hover:via-cyan-800 dark:hover:to-blue-800",
  "default": "bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900 text-emerald-700 dark:text-emerald-300 hover:from-emerald-200 hover:via-teal-200 hover:to-cyan-200 dark:hover:from-emerald-800 dark:hover:via-teal-800 dark:hover:to-cyan-800"
};

const LoadingSkeleton = () => (
  <div className="w-full">
    <Carousel className="w-full">
      <CarouselContent>
        {[1, 2, 3].map((_, index) => (
          <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
            <Card className="h-full flex flex-col bg-gradient-to-br from-white via-amber-50/30 to-white dark:from-slate-800 dark:via-amber-900/10 dark:to-slate-900">
              <Skeleton className="w-full h-[200px]" />
              <CardContent className="flex-grow p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex flex-col gap-2 mt-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="w-full py-12 flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-2">
      <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Erreur de chargement</h3>
    <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">{error}</p>
    <Button 
      variant="outline"
      className="mt-4 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      onClick={() => window.location.reload()}
    >
      Réessayer
    </Button>
  </div>
);

const EmptyState = () => (
  <div className="w-full py-12 flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-2">
      <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400">Aucune formation disponible</h3>
    <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
      Il n'y a actuellement aucune formation à afficher. Revenez plus tard pour découvrir nos nouvelles formations.
    </p>
    <Button 
      variant="outline"
      className="mt-4 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
      onClick={() => window.location.reload()}
    >
      Actualiser
    </Button>
  </div>
);

const getCapacityStatus = (enrolled, capacity) => {
  const percentage = (enrolled / capacity) * 100;
  if (percentage >= 100) return { text: 'Complet', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/20' };
  if (percentage >= 80) return { text: 'Presque complet', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
  if (percentage >= 50) return { text: 'Places limitées', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
  return { text: 'Places disponibles', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' };
};

// Ajout d'une fonction utilitaire pour localStorage
const LOCAL_REQUESTED_KEY = 'requestedFormations';
function getLocalRequested() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_REQUESTED_KEY)) || [];
  } catch {
    return [];
  }
}
function setLocalRequested(ids) {
  localStorage.setItem(LOCAL_REQUESTED_KEY, JSON.stringify(ids));
}

export default function TrainingCarousel() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);
  const [showBottomButton, setShowBottomButton] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, formationId: null });
  const [requested, setRequested] = useState({}); // { [formationId]: true }
  const [requesting, setRequesting] = useState({}); // { [formationId]: true }
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

  const navigate = useNavigate();

  const { profileData } = useContext(ProfileContext) || {};
  const { createNotification } = useNotifications();
  const isProfileAcknowledged = profileData?.stats?.profile?.isAcknowledged;

  useEffect(() => {
    const fetchFormationsAndRequests = async () => {
      try {
        const [data, myRequests] = await Promise.all([
          formationService.getAllFormations(),
          formationService.getMyEnrollmentRequests ? formationService.getMyEnrollmentRequests() : fetchMyRequestsFallback()
        ]);
        // Limiter à 4 formations maximum
        setFormations((data.formations || []).slice(0, 4));
        // Récupérer les IDs déjà demandés côté API
        let requestedIds = [];
        if (myRequests && myRequests.requests) {
          requestedIds = myRequests.requests.map(r => r.formation.id);
        } else if (Array.isArray(myRequests)) {
          requestedIds = myRequests.map(r => r.formation?.id || r.formation_id);
        }
        // Ajouter les IDs du localStorage (optimisme UI)
        const localIds = getLocalRequested();
        const allIds = Array.from(new Set([...requestedIds, ...localIds]));
        // Mettre à jour le state
        setRequested(Object.fromEntries(allIds.map(id => [id, true])));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFormationsAndRequests();
  }, []);

  // Fallback si pas de méthode formationService.getMyEnrollmentRequests
  async function fetchMyRequestsFallback() {
    const res = await fetch('/api/formation-requests/my', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('Erreur lors du chargement des demandes');
    return await res.json();
  }

  useEffect(() => {
    if (!api) return;

    const updateVisibility = () => {
      // Obtenir l'index du dernier slide
      const lastIndex = api.scrollSnapList().length - 1;
      // Obtenir l'index actuel
      const selectedIndex = api.selectedScrollSnap();
      // Obtenir le nombre de slides visibles
      const slidesInView = api.slidesInView();
      
      // La dernière carte est visible si elle est dans la vue
      const isLastVisible = slidesInView.includes(lastIndex);
      setShowBottomButton(!isLastVisible);
    };

    // Mettre à jour la visibilité initiale
    updateVisibility();

    // Mettre à jour lors du défilement
    api.on("select", updateVisibility);
    api.on("reInit", updateVisibility);

    return () => {
      api.off("select", updateVisibility);
      api.off("reInit", updateVisibility);
    };
  }, [api]);

  const handleImageClick = (id) => {
    // Navigation vers la page de détail de la formation
    console.log(`Navigating to formation details: ${id}`);
  };

  const handleSeeMore = (id) => {
    // Navigation vers la page de détail de la formation
    console.log(`Navigating to formation details: ${id}`);
  };

  const handleSeeAllCourses = () => {
    navigate('/formations/list');
  };

  const handleRequestJoin = async (formationId, skipConfirm = false) => {
    console.log('[TrainingCarousel] handleRequestJoin called', { formationId, skipConfirm });
    setRequesting((prev) => ({ ...prev, [formationId]: true }));
    setRequested((prev) => {
      const next = { ...prev, [formationId]: true };
      setLocalRequested(Object.keys(next).map(Number));
      return next;
    });
    try {
      const formation = formations.find(f => f.id === formationId);
      console.log('[TrainingCarousel] formation trouvé ?', { formation });
      await formationService.requestEnrollment(formationId);
      // Appel formationNotifications.requested (notification Firestore + UI)
      if (formation) {
        console.log('[TrainingCarousel] Avant formationNotifications.requested', { formation });
        await formationNotifications.requested({
          formationName: formation.name,
          formationId: formation.id,
          userId: profileData?.id
        });
        console.log('[TrainingCarousel] Après formationNotifications.requested');
        // Notifier le recruteur si l'utilisateur est guest
        const userRoles = profileData?.roles || profileData?.userRoles || [];
        const isGuest = Array.isArray(userRoles)
          ? userRoles.some(role => typeof role === 'object' ? role.name === 'ROLE_GUEST' || role.name === 'GUEST' : role === 'ROLE_GUEST' || role === 'GUEST')
          : userRoles === 'ROLE_GUEST' || userRoles === 'GUEST';
        const recruiterId = formation.recruiterId || (formation.recruiter && formation.recruiter.id);
        console.log('[DEBUG] formation object:', formation);
        console.log('[DEBUG] recruiterId:', recruiterId, 'isGuest:', isGuest);
        if (isGuest && recruiterId) {
          await formationNotifications.guestApplication({
            formationName: formation.name,
            recruiterId,
            guestId: profileData?.id
          });
          console.log('[TrainingCarousel] Notification envoyée au recruteur', recruiterId);
        }
      }
      toast.success(
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-bold">Demande envoyée !</span>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error('[TrainingCarousel] Erreur dans handleRequestJoin', error);
      // Si l'erreur indique que la demande a quand même été créée, on notifie !
      if (
        error?.message && error.message.toLowerCase().includes("demande d'inscription créée avec succès")
      ) {
        const formation = formations.find(f => f.id === formationId);
        if (formation) {
          console.log('[TrainingCarousel] Notification malgré erreur "succès"', { formation });
          await formationNotifications.requested({
            formationName: formation.name,
            formationId: formation.id,
            userId: profileData?.id
          });
          // Ajout notification recruteur même en cas d'erreur "succès"
          const userRoles = profileData?.roles || profileData?.userRoles || [];
          const isGuest = Array.isArray(userRoles)
            ? userRoles.some(role => typeof role === 'object' ? role.name === 'ROLE_GUEST' || role.name === 'GUEST' : role === 'ROLE_GUEST' || role === 'GUEST')
            : userRoles === 'ROLE_GUEST' || userRoles === 'GUEST';
          const recruiterId = formation.recruiterId || (formation.recruiter && formation.recruiter.id);
          console.log('[DEBUG][catch] formation object:', formation);
          console.log('[DEBUG][catch] recruiterId:', recruiterId, 'isGuest:', isGuest);
          if (isGuest && recruiterId) {
            await formationNotifications.guestApplication({
              formationName: formation.name,
              recruiterId,
              guestId: profileData?.id
            });
            console.log('[TrainingCarousel][catch] Notification envoyée au recruteur', recruiterId);
          }
        }
        toast.success(
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="font-bold">Demande envoyée !</span>
          </div>,
          { duration: 5000 }
        );
        return;
      }
      if (
        error?.message && error.message.toLowerCase().includes('compléter votre profil')
      ) {
        setProfileDialogOpen(true);
        setConfirmDialog({ open: false, formationId: null });
      } else if (
        (error?.message && error.message.toLowerCase().includes('déjà en cours')) ||
        (error?.response?.status === 409)
      ) {
        toast.error('Vous avez déjà fait une demande pour cette formation.');
      } else {
        toast.error(error.message || "Erreur lors de la demande d'inscription à la formation.");
      }
    } finally {
      setRequesting((prev) => ({ ...prev, [formationId]: false }));
      setConfirmDialog({ open: false, formationId: null });
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (formations.length === 0) return <EmptyState />;

  // Ajouter la carte "Voir tout" si nécessaire
  const carouselItems = [...formations, { id: "see-all", isSeeAllCard: true }];

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg">
      <div className="relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            containScroll: false,
          }}
        >
          <CarouselContent className="-ml-4">
            {carouselItems.map((item) => (
              <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-2/5">
                {item.isSeeAllCard ? (
                  <Card className="h-full flex flex-col bg-gradient-to-br from-white via-amber-50/5 to-white dark:from-slate-800 dark:via-amber-900/5 dark:to-slate-800 border-dashed border-2 border-amber-300/30 dark:border-amber-400/30 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-200/30 dark:hover:shadow-amber-400/20 hover:border-amber-400/50 dark:hover:border-amber-400/50 group">
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200/30 to-[#528eb2]/30 dark:from-amber-400/30 dark:to-[#78b9dd]/40 flex items-center justify-center mb-6 group-hover:from-amber-300/40 group-hover:to-[#528eb2]/40 dark:group-hover:from-amber-400/40 dark:group-hover:to-[#78b9dd]/50 transition-all duration-300">
                        <ArrowRight className="h-8 w-8 text-amber-600 dark:text-amber-300 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-primary">Découvrir toutes les formations</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Parcourez notre catalogue complet de formations professionnelles.
                      </p>
                      <MagicButton
                        className="w-full text-base font-medium bg-gradient-to-r from-amber-400 via-[#528eb2] to-[#78b9dd] hover:from-amber-400/10 hover:via-[#528eb2]/10 hover:to-[#78b9dd]/10 hover:text-amber-600 dark:hover:text-amber-300 transition-all duration-300"
                        onClick={handleSeeAllCourses}
                      >
                        Voir toutes les formations
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </MagicButton>
                    </div>
                  </Card>
                ) : (
                  <Card
                    className="h-full flex flex-col bg-white dark:bg-slate-800 shadow-lg border-0 overflow-hidden rounded-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => navigate(`/formations/${item.id}`)}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#02284f]/90 via-[#02284f]/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-lg font-semibold drop-shadow-lg">Voir détail</span>
                      </div>
                    </div>
                    <CardContent className="flex-grow p-4 sm:p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          className={`${badgeVariants[item.specialization?.name || 'default']} transition-all duration-300 text-xs sm:text-sm`}
                        >
                          {item.specialization?.name || 'Formation'}
                        </Badge>
                        <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 border-amber-200 dark:border-amber-700/50 text-xs sm:text-sm">
                          {item.promotion}
                        </Badge>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm line-clamp-3 min-h-[3em]">
                        {item.description || 'Aucune description disponible'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs sm:text-sm w-full">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Début le {item.dateStart ? (item.dateStart instanceof Date ? item.dateStart.toLocaleDateString() : new Date(item.dateStart).toLocaleDateString()) : ''}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-2 text-[#528eb2] dark:text-[#78b9dd]">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      {requested[item.id] ? (
                        <Button
                          className="w-full text-sm sm:text-base font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed flex items-center justify-center gap-2"
                          disabled
                          onClick={e => e.stopPropagation()}
                        >
                          <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Demande envoyée
                        </Button>
                      ) : (
                        <MagicButton
                          className="w-full text-sm sm:text-base font-medium bg-gradient-to-r from-amber-400 via-[#528eb2] to-[#78b9dd] hover:from-transparent hover:to-transparent hover:text-amber-600 dark:hover:text-white"
                          onClick={e => {
                            e.stopPropagation();
                            if (isProfileAcknowledged === false) {
                              setProfileDialogOpen(true);
                            } else {
                              setConfirmDialog({ open: true, formationId: item.id });
                            }
                          }}
                          disabled={requesting[item.id]}
                        >
                          Demander à rejoindre
                          <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </MagicButton>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        
          <div className="mt-10 flex justify-center">
            <Button
              onClick={handleSeeAllCourses}
              className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-600 dark:text-amber-300 border-2 border-amber-400 dark:border-amber-500/50 hover:from-amber-500 hover:to-amber-400 hover:text-white dark:hover:from-amber-400 dark:hover:to-amber-500 dark:hover:text-white transition-all duration-300 px-8 py-6 text-lg font-medium rounded-md group shadow-lg hover:shadow-xl hover:shadow-amber-200/30 dark:hover:shadow-amber-400/20"
            >
              Voir toutes les formations
              <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la demande</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment rejoindre cette formation ? Cette action enverra une demande d'inscription.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, formationId: null })}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                console.log('[TrainingCarousel] Dialog Confirmer clicked', confirmDialog.formationId);
                handleRequestJoin(confirmDialog.formationId, true);
              }}
              disabled={requesting[confirmDialog.formationId]}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Profile Completion Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-amber-50 via-blue-50 to-white dark:from-amber-900/30 dark:via-blue-900/20 dark:to-slate-900 p-0 overflow-hidden">
          <div className="flex flex-col items-center px-6 pt-8 pb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 shadow-lg">
              <InfoIcon className="w-12 h-12 text-white dark:text-white" />
            </div>
            <DialogHeader className="w-full text-center">
              <DialogTitle className="text-2xl font-bold mb-2">Profil à compléter !</DialogTitle>
              <DialogDescription asChild>
                <div className="mb-4 text-base text-gray-700 dark:text-gray-200">
                  <span className="block mb-2">Oups, il te manque encore quelques infos pour pouvoir faire une 
demande :</span>
                  <ul className="list-disc pl-6 space-y-1 text-left">
                    <li>
                      <button
                        type="button"
                        className="underline text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors cursor-pointer p-0 bg-transparent border-0"
                        onClick={() => {
                          setProfileDialogOpen(false);
                          navigate('/settings/profile');
                        }}
                      >
                        Ajoute ton profil LinkedIn
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="underline text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors cursor-pointer p-0 bg-transparent border-0"
                        onClick={() => {
                          setProfileDialogOpen(false);
                          navigate('/settings/career');
                        }}
                      >
                        Dépose ton CV
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="underline text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors cursor-pointer p-0 bg-transparent border-0"
                        onClick={() => {
                          setProfileDialogOpen(false);
                          navigate('/settings/career');
                        }}
                      >
                        Ajoute au moins un diplôme
                      </button>
                    </li>
                  </ul>
                  <span className="block mt-4">C'est rapide, et ça t'ouvrira toutes les portes 🚀</span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full flex flex-col gap-2 mt-2">
              <Button asChild variant="default" className="w-full text-base font-semibold">
                <a href="/settings/profile" className="text-primary" onClick={() => setProfileDialogOpen(false)}>
                  Compléter mon profil
                </a>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 