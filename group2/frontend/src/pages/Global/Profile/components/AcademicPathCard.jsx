import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const AcademicPathCard = ({ studentData = {} }) => {
  const calculateProgress = (current, total) => {
    if (!current || !total || total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  // Valeurs par défaut pour éviter les erreurs
  const {
    currentClass = "Non spécifié",
    currentYear = new Date().getFullYear(),
    creditsObtained = 0,
    totalCredits = 60,
    remainingMonths = 0,
    academicHistory = [],
    upcomingEvents = []
  } = studentData;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <div className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
          <CardTitle className="text-lg">Parcours académique</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Promotion actuelle */}
        <div>
          <h3 className="text-lg font-medium mb-4">Promotion actuelle</h3>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-bold text-lg">{currentClass}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Année {currentYear} - {parseInt(currentYear) + 1}
                  </p>
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    En cours
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progression dans le cursus */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Progression dans le cursus</h3>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {calculateProgress(creditsObtained, totalCredits)}%
            </span>
          </div>
          <div className="space-y-4">
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                style={{ width: `${calculateProgress(creditsObtained, totalCredits)}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">Crédits obtenus</span>
                </div>
                <p className="text-2xl font-bold">{creditsObtained}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Crédits totaux</span>
                </div>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Temps restant</span>
                </div>
                <p className="text-2xl font-bold">{remainingMonths} mois</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historique académique */}
        {academicHistory.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Historique académique</h3>
            <div className="space-y-4">
              {academicHistory.map((item, index) => (
                <div 
                  key={index}
                  className="relative flex items-start gap-4 pb-8 last:pb-0"
                >
                  <div className="absolute top-0 left-[15px] bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="relative z-10">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.className || 'Non spécifié'}</h4>
                      <Badge variant="outline">
                        {item.year || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description || 'Aucune description'}</p>
                    {item.achievements && item.achievements.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.achievements.map((achievement, i) => (
                          <Badge key={i} variant="secondary">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendrier académique */}
        {upcomingEvents.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Calendrier académique</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Événements à venir</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.title || 'Événement'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.description || 'Aucune description'}</p>
                      </div>
                      <Badge variant="outline" className={
                        event.type === 'exam' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                        event.type === 'deadline' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }>
                        {event.date ? new Date(event.date).toLocaleDateString() : 'Date non spécifiée'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message si aucune donnée n'est disponible */}
        {!academicHistory.length && !upcomingEvents.length && (
          <div className="text-center py-6">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Aucune donnée académique disponible</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Les informations sur votre parcours académique apparaîtront ici
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicPathCard; 