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
import { useNavigate } from 'react-router-dom';

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
    specialization,
    description,
    dateStart,
    location
  } = formation;

  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate ? useNavigate() : null;

  // Mode liste ou grille : même contenu simplifié
  return (
    <Card
      className="h-full flex flex-col bg-white dark:bg-slate-800 shadow-lg border-0 overflow-hidden rounded-lg transition-all duration-300 group cursor-pointer"
      onClick={() => navigate && navigate(`/formations/${id}`)}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={image_url || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#02284f]/90 via-[#02284f]/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-lg font-semibold drop-shadow-lg">Voir détail</span>
        </div>
      </div>
      <CardContent className="flex-grow p-4 sm:p-6">
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
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 line-clamp-2">
          {name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm line-clamp-3 min-h-[3em]">
          {description || 'Aucune description disponible'}
        </p>
        <div className="flex justify-between items-center mt-2 text-xs sm:text-sm w-full">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Début le {dateStart ? (dateStart instanceof Date ? dateStart.toLocaleDateString() : new Date(dateStart).toLocaleDateString()) : ''}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-[#528eb2] dark:text-[#78b9dd]">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {requested ? (
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
              setConfirmDialogOpen(true);
            }}
            disabled={requesting}
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
            <Button onClick={async e => { e.stopPropagation(); await handleRequestJoin(); }} disabled={requesting}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FormationCard;