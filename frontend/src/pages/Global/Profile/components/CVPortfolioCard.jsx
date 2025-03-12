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
  FileText,
  Download,
  Upload,
  Plus,
  ExternalLink,
  Github,
  Globe,
  Star,
  GitFork,
  Eye,
} from 'lucide-react';

const CVPortfolioCard = ({ cvData = {} }) => {
  // Valeurs par défaut pour éviter les erreurs
  const {
    skills = [],
    education = [],
    experience = [],
    projects = [],
    cvUrl = "",
    portfolioUrl = ""
  } = cvData;

  // Si aucune donnée n'est disponible
  if (!skills.length && !education.length && !experience.length && !projects.length && !cvUrl && !portfolioUrl) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">CV et portfolio</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Aucun CV ou portfolio disponible</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Ajoutez votre CV et vos projets pour les mettre en valeur
            </p>
            <div className="mt-4">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter un CV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-lg">CV et portfolio</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Actions CV */}
        <div className="flex flex-wrap gap-3">
          {cvUrl ? (
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le CV
            </Button>
          ) : (
            <Button className="flex-1 sm:flex-none">
              <Upload className="h-4 w-4 mr-2" />
              Ajouter un CV
            </Button>
          )}
          
          {portfolioUrl ? (
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => window.open(portfolioUrl, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir le portfolio
            </Button>
          ) : (
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un portfolio
            </Button>
          )}
        </div>

        {/* Compétences techniques */}
        {skills.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Compétences techniques</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Projets */}
        {projects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Projets</h3>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{project.name || 'Projet sans nom'}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {project.description || 'Aucune description'}
                      </p>
                    </div>
                    {project.url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        onClick={() => window.open(project.url, '_blank')}
                      >
                        {project.type === 'github' ? (
                          <Github className="h-4 w-4" />
                        ) : (
                          <Globe className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {project.type === 'github' && project.stats && (
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Star className="h-3.5 w-3.5 mr-1" />
                        <span>{project.stats.stars || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <GitFork className="h-3.5 w-3.5 mr-1" />
                        <span>{project.stats.forks || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>{project.stats.watchers || 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton d'ajout de projet */}
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un projet
        </Button>
      </CardContent>
    </Card>
  );
};

export default CVPortfolioCard; 