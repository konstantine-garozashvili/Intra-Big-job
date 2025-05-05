import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, MapPin, ChevronRight } from "lucide-react";
import { MagicButton } from "@/components/ui/magic-button";

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

const FormationCard = ({ formation, onRequestJoin, viewMode }) => {
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
    specialization
  } = formation;

  return (
    <Card className="h-full flex flex-col bg-white dark:bg-slate-800 shadow-lg border-0 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-amber-200/30 dark:hover:shadow-amber-400/20 group">
      <div className="relative aspect-[16/9] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#02284f]/90 via-[#02284f]/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-white font-medium">Voir la formation</span>
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

        <div className="flex flex-col gap-2 mt-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Début le {new Date(dateStart).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-[#528eb2] dark:text-[#78b9dd]">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{duration} mois</span>
          </div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Capacité: {capacity} étudiants</span>
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
        <MagicButton
          className="w-full text-sm sm:text-base font-medium bg-gradient-to-r from-amber-400 via-[#528eb2] to-[#78b9dd] hover:from-transparent hover:to-transparent dark:hover:text-white"
          onClick={() => onRequestJoin(id)}
        >
          Demander à rejoindre
          <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </MagicButton>
      </CardFooter>
    </Card>
  );
};

export default FormationCard; 