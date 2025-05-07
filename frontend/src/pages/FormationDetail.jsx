import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formationService } from '@/services/formation.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Lock, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { MagicButton } from '@/components/ui/magic-button';
import { ProfileContext } from '@/components/MainLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { profileData } = useContext(ProfileContext) || {};
  const isProfileAcknowledged = profileData?.stats?.profile?.isAcknowledged;
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    formationService.getFormation(id)
      .then(f => {
        setFormation(f);
        // Vérifie si déjà demandé (à adapter selon ton API)
        const localRequested = JSON.parse(localStorage.getItem('requestedFormations') || '[]');
        setRequested(localRequested.includes(Number(id)));
      })
      .catch(e => setError(e.message || 'Erreur lors du chargement de la formation.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestJoin = async () => {
    if (!isProfileAcknowledged) {
      setProfileDialogOpen(true);
      return;
    }
    setRequesting(true);
    setRequested(true);
    const localRequested = JSON.parse(localStorage.getItem('requestedFormations') || '[]');
    localStorage.setItem('requestedFormations', JSON.stringify([...new Set([...localRequested, Number(id)])]));
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
      toast.error(error.message || "Erreur lors de la demande d'inscription à la formation.");
      setRequested(false);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>Une erreur est survenue lors du chargement de la formation.</p>
        <p className="text-sm">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    );
  }

  const {
    name,
    promotion,
    image_url,
    description,
    capacity,
    duration,
    dateStart,
    location,
    specialization,
    students = []
  } = formation;

  const enrolledCount = students.length;
  const progressPercentage = Math.min((enrolledCount / (capacity || 1)) * 100, 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      <Card className="relative rounded-3xl shadow-xl bg-white border border-gray-200 overflow-visible">
        <CardContent className="p-0">
          <div className="flex flex-col items-center gap-4 pt-12 pb-8 px-8">
            <div className="-mt-20 mb-2 z-10">
              <div className="w-32 h-32 rounded-full shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={image_url || '/placeholder.svg'}
                  alt={name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="font-extrabold text-3xl mb-1 text-gray-900 dark:text-white text-center drop-shadow tracking-tight animate-fade-in">{name}</div>
            <div className="flex flex-wrap gap-2 mb-2 animate-fade-in">
              <Badge className="bg-[#2563eb] text-white font-semibold shadow-sm animate-bounceIn">{specialization?.name || 'Formation'}</Badge>
              <Badge variant="outline" className="border-[#2563eb] text-[#2563eb] bg-white font-semibold animate-bounceIn delay-100">{promotion || 'N/A'}</Badge>
            </div>
            <div className="text-gray-700 dark:text-gray-100 mb-2 text-center max-w-xl animate-fade-in-slow">{description}</div>
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center mt-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
                <Calendar className="h-5 w-5" />
                <span>Début : {dateStart ? new Date(dateStart).toLocaleDateString() : 'Non défini'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#528eb2] dark:text-[#78b9dd]">
                <Clock className="h-5 w-5" />
                <span>{duration} mois</span>
              </div>
              {location && (
                <div className="flex items-center gap-2 text-[#528eb2] dark:text-[#78b9dd]">
                  <MapPin className="h-5 w-5" />
                  <span>{location}</span>
                </div>
              )}
            </div>
            <div className="w-full mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-base font-medium">
                    {enrolledCount} / {capacity} étudiants inscrits
                  </span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            {students && students.length > 0 && (
              <div className="w-full mt-8">
                <h4 className="font-semibold mb-2">Étudiants inscrits :</h4>
                <ul className="list-disc pl-6 space-y-1 text-left text-sm">
                  {students.map((s, idx) => (
                    <li key={s.id || idx}>{s.firstname} {s.lastname} ({s.email})</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="w-full flex justify-center mt-8">
              <MagicButton
                className="w-full max-w-xs text-base font-medium bg-gradient-to-r from-amber-400 via-[#528eb2] to-[#78b9dd] hover:from-transparent hover:to-transparent hover:text-amber-600 dark:hover:text-white"
                onClick={handleRequestJoin}
                disabled={requested || requesting}
              >
                {requested ? (
                  <span className="flex items-center justify-center gap-2"><Lock className="h-4 w-4 mr-2" /> Demande envoyée</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">Demander à rejoindre <ChevronRight className="ml-2 h-4 w-4" /></span>
                )}
              </MagicButton>
            </div>
          </div>
        </CardContent>
      </Card>
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
                  <span className="block mb-2">Oups, il te manque encore quelques infos pour pouvoir demander une formation :</span>
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
              <Button variant="outline" onClick={() => setProfileDialogOpen(false)} className="w-full">
                Fermer
              </Button>
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