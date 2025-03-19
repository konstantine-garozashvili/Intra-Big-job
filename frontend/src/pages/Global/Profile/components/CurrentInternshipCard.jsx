import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  User,
  ExternalLink,
  FileText,
  Download,
  Upload,
} from 'lucide-react';

const CurrentInternshipCard = ({ internshipData = {} }) => {
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "Durée non spécifiée";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    return `${diffMonths} mois`;
  };

  // Valeurs par défaut pour éviter les erreurs
  const {
    company = "Non spécifié",
    position = "Non spécifié",
    startDate,
    endDate,
    location = "Non spécifié",
    supervisor = "Non spécifié",
    description = "Aucune description disponible",
    skills = [],
    reports = []
  } = internshipData;

  // Si aucune donnée de stage n'est disponible
  if (!company && !position && !startDate && !endDate) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-lg">Stage actuel</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-6">
            <Briefcase className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Aucun stage en cours</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Les informations sur votre stage apparaîtront ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
        <div className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-lg">Stage actuel</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Informations principales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{position}</h3>
              <div className="flex items-center mt-1 text-gray-600 dark:text-gray-300">
                <Building className="h-4 w-4 mr-1" />
                <span>{company}</span>
              </div>
              <div className="flex items-center mt-1 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{location}</span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{startDate ? new Date(startDate).toLocaleDateString() : 'Date non spécifiée'} - {endDate ? new Date(endDate).toLocaleDateString() : 'Date non spécifiée'}</span>
              </div>
              <div className="flex items-center mt-1 text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4 mr-1" />
                <span>{calculateDuration(startDate, endDate)}</span>
              </div>
              <div className="flex items-center mt-1 text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4 mr-1" />
                <span>Superviseur: {supervisor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-medium mb-3">Description</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300">{description}</p>
          </div>
        </div>

        {/* Compétences */}
        {skills.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Compétences développées</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Rapports */}
        {reports && reports.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Rapports et documents</h3>
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">{report.title || 'Document'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.date ? new Date(report.date).toLocaleDateString() : 'Date non spécifiée'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    onClick={() => window.open(report.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button className="flex-1 sm:flex-none">
            <Upload className="h-4 w-4 mr-2" />
            Soumettre un rapport
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir la convention
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentInternshipCard; 