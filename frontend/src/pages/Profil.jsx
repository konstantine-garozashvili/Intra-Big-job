import React, { useState, useEffect } from "react";
import profilService from "../lib/services/profilService";
import { authService } from "../lib/services/authService";
import { studentProfileService } from "../lib/services";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound,
  Award,
  MapPin,
  BarChart,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import PageTransition from "../components/PageTransition";

// Variantes d'animation pour les cartes
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

// Variantes d'animation pour les éléments intérieurs
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (custom) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.05 + 0.3,
      duration: 0.3,
    },
  }),
};

// Animation pour la barre de progression
const progressVariants = {
  hidden: { width: 0 },
  visible: (custom) => ({
    width: `${custom}%`,
    transition: {
      delay: 0.5,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

const Profil = () => {
  // États pour stocker les données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilData, setProfilData] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Utiliser React Query pour le profil étudiant
  const { data: studentData, refetch: refetchStudentProfile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: studentProfileService.getMyProfile,
    enabled: false, // Désactivé par défaut, activé dans useEffect
    staleTime: 30 * 1000, // 30 secondes
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await authService.logout();

      setLogoutDialogOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const fetchProfilData = async () => {
      try {
        setLoading(true);

        // Charger toutes les données en une seule requête
        const allData = await profilService.getAllProfilData();
        setProfilData(allData);

        // Si l'utilisateur est un étudiant, activer la requête React Query
        const user = await authService.getCurrentUser();
        if (user?.roles?.includes('ROLE_STUDENT')) {
          // Activer la requête en mettant à jour la configuration
          queryClient.setQueryDefaults(['studentProfile'], {
            enabled: true,
          });
          // Déclencher un rafraîchissement immédiat
          refetchStudentProfile();
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données du profil:",
          error
        );
        setError("Une erreur est survenue lors du chargement des données.");
        setLoading(false);
      }
    };

    fetchProfilData();
  }, [refetchStudentProfile, queryClient]);

  // Fonction de rendu conditionnel pour le contenu
  const renderContent = () => {
    // Rendu conditionnel pendant le chargement
    if (loading) {
      return (
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Mon Profil
            </h1>
            <Skeleton className="h-10 w-32 rounded-md" />{" "}
            {/* Espace pour le bouton de déconnexion */}
          </div>

          {/* Skeleton pour les deux cartes principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Skeleton Profil Utilisateur */}
            <Card className="overflow-hidden border-0 shadow-lg min-h-[250px]">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <Skeleton className="h-6 w-36" /> {/* Titre de la carte */}
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-7 w-3/4" /> {/* Nom complet */}
                <Skeleton className="h-5 w-1/2" /> {/* Email */}
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-5 w-2/3" /> {/* Téléphone */}
                  <Skeleton className="h-5 w-2/3" /> {/* Membre depuis */}
                </div>
              </CardContent>
            </Card>

            {/* Skeleton Statistiques */}
            <Card className="overflow-hidden border-0 shadow-lg min-h-[250px]">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <Skeleton className="h-6 w-36" /> {/* Titre de la carte */}
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Skeleton className="h-5 w-1/2 mb-2" />{" "}
                  {/* Titre Complétude */}
                  <Skeleton className="h-3 w-full rounded-full" />{" "}
                  {/* Barre de progression */}
                  <Skeleton className="h-4 w-16 mt-1" /> {/* Pourcentage */}
                </div>
                <div>
                  <Skeleton className="h-5 w-1/3 mb-2" />{" "}
                  {/* Titre Membre depuis */}
                  <Skeleton className="h-6 w-16" /> {/* Nombre de jours */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skeleton pour les onglets */}
          <div className="w-full">
            <Skeleton className="h-10 w-48 mb-4 rounded-full" /> {/* Onglets */}
            {/* Skeleton pour le contenu de l'onglet sélectionné */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
                <Skeleton className="h-6 w-40" /> {/* Titre de la section */}
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-28 w-full rounded-md" /> {/* Contenu */}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Rendu en cas d'erreur
    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto p-6"
        >
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md"
            role="alert"
          >
            <div className="flex items-center">
              <svg
                className="h-6 w-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <strong className="font-bold text-lg">Erreur!</strong>
            </div>
            <p className="mt-2">{error}</p>
            <div className="mt-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    // Rendu principal du composant avec les données
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Mon Profil
          </h1>
        </motion.div>

        {/* Dialogue de confirmation de déconnexion */}
        <AnimatePresence>
          {logoutDialogOpen && (
            <Dialog
              open={logoutDialogOpen}
              onOpenChange={(open) =>
                !isLoggingOut && setLogoutDialogOpen(open)
              }
            >
              <DialogContent className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border-0 shadow-xl">
                <motion.div
                  className="overflow-y-auto max-h-[70vh]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Confirmation de déconnexion
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      Êtes-vous sûr de vouloir vous déconnecter de votre compte
                      ? Toutes vos sessions actives seront fermées.
                    </DialogDescription>
                  </DialogHeader>
                </motion.div>
                <DialogFooter className="mt-6 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setLogoutDialogOpen(false)}
                    disabled={isLoggingOut}
                    className="rounded-full border-2 hover:bg-gray-100 transition-all duration-200"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200 ${
                      isLoggingOut ? "opacity-80" : ""
                    }`}
                  >
                    {isLoggingOut ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="mr-2 h-4 w-4"
                        >
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </motion.div>
                        Déconnexion en cours...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Informations utilisateur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="h-full"
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 pb-6">
                <div className="flex items-center">
                  <UserRound className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-xl">Profil Utilisateur</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-grow flex flex-col justify-between">
                {profilData?.user && (
                  <div className="space-y-4 h-full flex flex-col justify-between">
                    <motion.div
                      custom={0}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {profilData.user.firstName} {profilData.user.lastName}
                      </h2>
                      <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                        <Mail className="h-4 w-4 mr-2" />
                        <p>{profilData.user.email}</p>
                      </div>
                    </motion.div>

                    <div className="mt-auto space-y-3">
                      <motion.div
                        custom={1}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center text-gray-700 dark:text-gray-200"
                      >
                        <Phone className="h-4 w-4 mr-3 text-blue-500" />
                        <div>
                          <span className="font-medium">Téléphone:</span>
                          <span className="ml-2">
                            {profilData.user.phoneNumber}
                          </span>
                        </div>
                      </motion.div>

                      <motion.div
                        custom={2}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center text-gray-700 dark:text-gray-200"
                      >
                        <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                        <div>
                          <span className="font-medium">Membre depuis:</span>
                          <span className="ml-2">
                            {new Date(
                              profilData.user.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="h-full"
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 pb-6">
                <div className="flex items-center">
                  <BarChart className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                  <CardTitle className="text-xl">Statistiques</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                {profilData?.stats && (
                  <div className="space-y-6 h-full flex flex-col justify-between">
                    <motion.div
                      custom={0}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <h3 className="font-medium text-lg text-gray-700 dark:text-gray-200">
                        Complétude du profil
                      </h3>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
                        <motion.div
                          custom={profilData.stats.profile.completionPercentage}
                          variants={progressVariants}
                          initial="hidden"
                          animate="visible"
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                        <span>Progression</span>
                        <span className="font-semibold">
                          {Math.round(
                            profilData.stats.profile.completionPercentage
                          )}
                          %
                        </span>
                      </p>
                    </motion.div>

                    <motion.div
                      custom={1}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-4 rounded-xl mt-auto"
                    >
                      <h3 className="font-medium text-lg text-gray-700 dark:text-gray-200">
                        Membre depuis
                      </h3>
                      <div className="flex items-end mt-2">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                          {profilData.stats.daysSinceRegistration}
                        </span>
                        <span className="text-lg ml-2 text-gray-600 dark:text-gray-300">
                          jours
                        </span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Nouvelle carte pour la recherche d'emploi (si étudiant) */}
        {studentData && (studentData.isSeekingInternship || studentData.isSeekingApprenticeship) && (
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 pb-6">
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <CardTitle className="text-xl">Recherche d'emploi</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    {/* Status de recherche de stage */}
                    <motion.div
                      custom={0}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg text-gray-700 dark:text-gray-200 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                          Recherche d'emploi
                        </h3>
                        <div className={`rounded-full w-3 h-3 ${studentData.isSeekingInternship ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {studentData.isSeekingInternship 
                          ? "Vous êtes actuellement à la recherche d'un emploi." 
                          : "Vous n'êtes pas à la recherche d'un emploi pour le moment."}
                      </p>
                      {studentData.availableFromDate && studentData.isSeekingInternship && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Disponible à partir du:</span>{' '}
                          {new Date(studentData.availableFromDate).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>

                    {/* Status de recherche d'alternance */}
                    <motion.div
                      custom={1}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg text-gray-700 dark:text-gray-200 flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-purple-500" />
                          Recherche d'alternance
                        </h3>
                        <div className={`rounded-full w-3 h-3 ${studentData.isSeekingApprenticeship ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {studentData.isSeekingApprenticeship 
                          ? "Vous êtes actuellement à la recherche d'une alternance." 
                          : "Vous n'êtes pas à la recherche d'une alternance pour le moment."}
                      </p>
                      {studentData.availableFromDate && studentData.isSeekingApprenticeship && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Disponible à partir du:</span>{' '}
                          {new Date(studentData.availableFromDate).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Note concernant la modification des paramètres */}
                  <motion.div
                    custom={2}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center"
                  >
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/settings/career')}
                      className="text-sm"
                    >
                      Modifier mes préférences de recherche
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sections tabulaires - mettre à jour le paramètre custom */}
        <motion.div
          custom={studentData && (studentData.isSeekingInternship || studentData.isSeekingApprenticeship) ? 3 : 2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <Tabs defaultValue="addresses" className="w-full">
            <TabsList className="mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
              <TabsTrigger
                value="addresses"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-800 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white px-6 py-2 transition-all duration-300"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Adresses
              </TabsTrigger>
              <TabsTrigger
                value="diplomas"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-800 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white px-6 py-2 transition-all duration-300"
              >
                <Award className="h-4 w-4 mr-2" />
                Diplômes
              </TabsTrigger>
            </TabsList>

            {/* Conteneur avec hauteur minimale pour éviter les secousses */}
            <div className="min-h-[400px]">
              {/* Onglet des diplômes */}
              <TabsContent
                value="diplomas"
                className="focus-visible:outline-none focus-visible:ring-0 w-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <Card className="overflow-hidden border-0 shadow-lg w-full">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 pb-6">
                      <div className="flex items-center">
                        <Award className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                        <CardTitle className="text-xl">Mes diplômes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {profilData?.diplomas &&
                      profilData.diplomas.length > 0 ? (
                        <div className="overflow-x-auto w-full">
                          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Nom
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Date d'obtention
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                              {profilData.diplomas.map((diploma, index) => (
                                <motion.tr
                                  key={diploma.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    delay: index * 0.1,
                                    duration: 0.3,
                                  }}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {diploma.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {diploma.obtainedAt
                                      ? new Date(
                                          diploma.obtainedAt
                                        ).toLocaleDateString()
                                      : "Non spécifié"}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Award className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
                            Aucun diplôme trouvé.
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            Vous pourrez ajouter vos diplômes prochainement.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Onglet des adresses */}
              <TabsContent
                value="addresses"
                className="focus-visible:outline-none focus-visible:ring-0 w-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <Card className="overflow-hidden border-0 shadow-lg w-full">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 pb-6">
                      <div className="flex items-center">
                        <MapPin className="h-6 w-6 mr-2 text-orange-600 dark:text-orange-400" />
                        <CardTitle className="text-xl">Mes adresses</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {profilData?.addresses &&
                      profilData.addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profilData.addresses.map((address, index) => (
                            <motion.div
                              key={address.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 border border-gray-100 dark:border-gray-700"
                            >
                              <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                {address.name}
                              </p>
                              {address.complement && (
                                <p className="text-gray-600 dark:text-gray-400 mt-1 ml-6">
                                  {address.complement}
                                </p>
                              )}
                              <p className="text-gray-700 dark:text-gray-300 mt-2 ml-6">
                                {address.postalCode?.code} {address.city?.name}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
                            Aucune adresse trouvée.
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            Vous pourrez ajouter vos adresses prochainement.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <PageTransition>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
          {renderContent()}
        </div>
      </PageTransition>
    </>
  );
};

export default Profil;
