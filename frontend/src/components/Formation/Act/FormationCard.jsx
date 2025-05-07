import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, MapPin, ChevronRight, Lock } from "lucide-react";
import { MagicButton } from "@/components/ui/magic-button";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { formationService } from '@/services/formation.service';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

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

const getCapacityStatus = (enrolled, capacity) => {
  const percentage = (enrolled / capacity) * 100;
  if (percentage >= 100) return { text: "Complet", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/20" };
  if (percentage >= 80) return { text: "Presque complet", color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/20" };
  if (percentage >= 50) return { text: "Places limitées", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/20" };
  return { text: "Places disponibles", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/20" };
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

const FormationCard = ({ formation, viewMode }) => {
  const {
    id,
    name,
    promotion,
    image_url,
    capacity,
    duration,
    dateStart,
    description,
    location,
    specialization,
    students = []
  } = formation;

  const enrolledCount = students.length;
  const capacityStatus = getCapacityStatus(enrolledCount, capacity);
  const progressPercentage = Math.min((enrolledCount / capacity) * 100, 100);

  // State pour gestion du bouton
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch demandes existantes au chargement
  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      try {
        const res = await fetch('/api/formation-requests/my', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des demandes');
        const data = await res.json();
        const apiIds = (data.requests || []).map(r => r.formation.id);
        const localIds = getLocalRequested();
        if (isMounted) setRequested(apiIds.includes(id) || localIds.includes(id));
      } catch {
        // fallback local only
        if (isMounted) setRequested(getLocalRequested().includes(id));
      }
    }
    fetchRequests();
    return () => { isMounted = false; };
  }, [id]);

  // Handler demande
  const handleRequestJoin = async () => {
    setRequesting(true);
    setRequested(true);
    setLocalRequested(Array.from(new Set([...getLocalRequested(), id])));
    try {
      await formationService.requestEnrollment(id);
      toast.success(
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-bold">Demande envoyée !</span>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      if (
        error?.message && error.message.toLowerCase().includes('compléter votre profil')
      ) {
        toast.error('Complétez votre profil pour demander une formation.');
      } else if (
        (error?.message && error.message.toLowerCase().includes('déjà en cours')) ||
        (error?.response?.status === 409)
      ) {
        toast.error('Vous avez déjà fait une demande pour cette formation.');
      } else {
        toast.error(error.message || "Erreur lors de la demande d'inscription à la formation.");
      }
    } finally {
      setRequesting(false);
      setConfirmDialogOpen(false);
    }
  };

  const InfoItem = ({ icon: Icon, text, colorClass }) => (
    <div className={`flex items-center gap-2 ${colorClass}`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <Card className="flex flex-col sm:flex-row bg-white dark:bg-slate-800 shadow-lg border-0 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-amber-200/30 dark:hover:shadow-amber-400/20 group">
        {/* Image Section */}
        <div className="relative w-full sm:w-72 h-48 sm:h-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-[#02284f]/90 via-[#02284f]/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          </div>
          <img
            src={image_url || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-6 relative min-h-[220px]">
          <div className="flex-grow pb-16">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                className={`${badgeVariants[specialization?.name || 'default']} transition-all duration-300 text-xs sm:text-sm`}
              >
                {specialization?.name || 'Formation'}
              </Badge>
              <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 border-amber-200 dark:border-amber-700/50 text-xs sm:text-sm">
                {promotion}
              </Badge>
            </div>

            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 transition-transform duration-300 group-hover:translate-x-1">
                {name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                {description || 'Aucune description disponible'}
              </p>
            </div>

            {/* Capacity Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  <span className="text-sm font-medium">
                    {enrolledCount} / {capacity} étudiants
                  </span>
                </div>
                <Badge className={`${capacityStatus.bgColor} ${capacityStatus.color} text-xs`}>
                  {capacityStatus.text}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoItem
                icon={Calendar}
                text={`Début le ${new Date(dateStart).toLocaleDateString()}`}
                colorClass="text-amber-600 dark:text-amber-300"
              />
              <InfoItem
                icon={Clock}
                text={`${duration} mois`}
                colorClass="text-[#528eb2] dark:text-[#78b9dd]"
              />
              {location && (
                <InfoItem
                  icon={MapPin}
                  text={location}
                  colorClass="text-[#528eb2] dark:text-[#78b9dd]"
                />
              )}
            </div>
          </div>

          {/* Action Button - bottom right */}
          <div className="absolute bottom-6 right-6">
            {requested ? (
              <Button className="w-full text-sm sm:text-base font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed flex items-center justify-center gap-2" disabled>
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Demande envoyée
              </Button>
            ) : (
              <MagicButton
                className="text-sm sm:text-base font-medium bg-gradient-to-r from-amber-400 via-[#528eb2] to-[#78b9dd] hover:from-transparent hover:to-transparent hover:text-amber-600 dark:hover:text-white px-8 py-3"
                onClick={() => setConfirmDialogOpen(true)}
                disabled={enrolledCount >= capacity}
              >
                Demander à rejoindre
                <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </MagicButton>
            )}
          </div>
        </div>

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la demande</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment rejoindre cette formation ? Cette action enverra une demande d'inscription.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleRequestJoin} disabled={requesting}>
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="h-full flex flex-col bg-white dark:bg-slate-800 shadow-lg border-0 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-amber-200/30 dark:hover:shadow-amber-400/20 group">
      <div className="relative aspect-[16/9] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#02284f]/90 via-[#02284f]/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
        </div>
        <img
          src={image_url || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <CardContent className="flex-grow p-4 sm:p-6 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge
            className={`${badgeVariants[specialization?.name || 'default']} transition-all duration-300 text-xs sm:text-sm`}
          >
            {specialization?.name || 'Formation'}
          </Badge>
          <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 border-amber-200 dark:border-amber-700/50 text-xs sm:text-sm">
            {promotion}
          </Badge>
        </div>

        <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 transition-transform duration-300 group-hover:translate-x-1 line-clamp-2">
          {name}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3 min-h-[3em]">
          {description || 'Aucune description disponible'}
        </p>

        {/* Capacity Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <span className="text-sm font-medium">
                {enrolledCount} / {capacity} étudiants
              </span>
            </div>
            <Badge className={`${capacityStatus.bgColor} ${capacityStatus.color} text-xs`}>
              {capacityStatus.text}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 text-xs sm:text-sm">
          <InfoItem
            icon={Calendar}
            text={`Début le ${new Date(dateStart).toLocaleDateString()}`}
            colorClass="text-amber-600 dark:text-amber-300"
          />
          <InfoItem
            icon={Clock}
            text={`${duration} mois`}
            colorClass="text-[#528eb2] dark:text-[#78b9dd]"
          />
          {location && (
            <InfoItem
              icon={MapPin}
              text={location}
              colorClass="text-[#528eb2] dark:text-[#78b9dd]"
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {requested ? (
          <Button className="w-full text-sm sm:text-base font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed flex items-center justify-center gap-2" disabled>
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Demande envoyée
          </Button>
        ) : (
          <MagicButton
            className="w-full text-sm sm:text-base font-medium bg-gradient-to-r from-amber-400 via-[#528eb2] to-[#78b9dd] hover:from-transparent hover:to-transparent hover:text-amber-600 dark:hover:text-white"
            onClick={() => setConfirmDialogOpen(true)}
            disabled={enrolledCount >= capacity}
          >
            Demander à rejoindre
            <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </MagicButton>
        )}
      </CardFooter>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la demande</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment rejoindre cette formation ? Cette action enverra une demande d'inscription.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRequestJoin} disabled={requesting}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FormationCard;