import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronRight, Clock, Users, ArrowRight, Calendar, MapPin } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { formationService } from "@/services/formation.service";
import { MagicButton } from "@/components/ui/magic-button";
import { useNavigate } from "react-router-dom";

// Configuration des badges pour les spécialisations
const badgeVariants = {
  "Développement Web": "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800",
  "Data Science": "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800",
  "Cybersécurité": "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800",
  "DevOps": "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800",
  "IA": "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800",
  "Cloud Computing": "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800",
  "default": "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800"
};

export default function TrainingCarousel() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isLastVisible, setIsLastVisible] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const visibleItems = isMobile ? 1 : isTablet ? 2 : 3;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = await formationService.getAllFormations();
        // Limiter à 4 formations maximum
        setFormations(data.slice(0, 4));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    const onSelect = () => {
      const newCurrent = api.selectedScrollSnap();
      setCurrent(newCurrent);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setIsLastVisible(newCurrent >= count - visibleItems);
    };

    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api, count, visibleItems]);

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

  if (loading) return <div>Chargement des formations...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (formations.length === 0) return <div>Aucune formation disponible</div>;

  // Ajouter la carte "Voir tout" si nécessaire
  const carouselItems = [...formations, { id: "see-all", isSeeAllCard: true }];

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl">
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
                  // Special "See All Courses" card
                  <Card className="h-full flex flex-col bg-gradient-to-br from-[#528eb2]/10 to-[#528eb2]/30 dark:from-[#528eb2]/20 dark:to-[#528eb2]/40 border-dashed border-2 border-[#528eb2]/40 dark:border-[#528eb2]/50 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:border-[#528eb2]/60 group">
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#528eb2]/20 dark:bg-[#528eb2]/30 flex items-center justify-center mb-6 group-hover:bg-[#528eb2]/30 dark:group-hover:bg-[#528eb2]/40 transition-all duration-300">
                        <ArrowRight className="h-8 w-8 text-[#528eb2] dark:text-[#78b9dd] group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-[#02284f] dark:text-slate-100">Découvrir toutes les formations</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Parcourez notre catalogue complet de formations professionnelles.
                      </p>
                      <MagicButton
                        className="w-full text-base font-medium bg-[#528eb2] dark:bg-[#78b9dd] hover:text-[#528eb2] dark:hover:text-[#78b9dd] relative"
                        onClick={handleSeeAllCourses}
                      >
                        <span className="flex-1">Voir toutes les formations</span>
                        <ChevronRight className="h-5 w-5 flex-shrink-0" />
                      </MagicButton>
                    </div>
                  </Card>
                ) : (
                  // Regular formation card
                  <Card className="h-full flex flex-col bg-white dark:bg-slate-800 shadow-lg border-0 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-2xl group">
                    <div className="cursor-pointer relative overflow-hidden transform transition-transform duration-300 group-hover:scale-[1.02]" onClick={() => handleImageClick(item.id)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02284f]/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white font-medium">Voir la formation</span>
                      </div>
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="flex-grow p-6 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          className={`${badgeVariants[item.specialization?.name || 'default']} transition-colors duration-300`}
                        >
                          {item.specialization?.name || 'Formation'}
                        </Badge>
                        <Badge variant="outline">{item.promotion}</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-[#02284f] dark:text-slate-100 transition-transform duration-300 group-hover:translate-x-1">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{item.description || 'Aucune description disponible'}</p>
                      <div className="flex flex-col gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#528eb2] dark:text-[#78b9dd]" />
                          <span>Début le {new Date(item.date_start).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#528eb2] dark:text-[#78b9dd]" />
                          <span>{item.duration} semaines</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#528eb2] dark:text-[#78b9dd]" />
                          <span>Capacité: {item.capacity} étudiants</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#528eb2] dark:text-[#78b9dd]" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <MagicButton
                        className="w-full text-base font-medium bg-[#528eb2] dark:bg-[#78b9dd] hover:text-[#528eb2] dark:hover:text-[#78b9dd] relative"
                        onClick={() => handleSeeMore(item.id)}
                      >
                        <span className="flex-1">En savoir plus</span>
                        <ChevronRight className="h-5 w-5 flex-shrink-0" />
                      </MagicButton>
                    </CardFooter>
                  </Card>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        {!isLastVisible && (
          <div className="mt-10 flex justify-center">
            <Button
              onClick={handleSeeAllCourses}
              className="bg-white text-[#528eb2] dark:bg-slate-800 dark:text-[#78b9dd] border-2 border-[#528eb2] dark:border-[#78b9dd] hover:bg-[#528eb2] hover:text-white dark:hover:bg-[#78b9dd] dark:hover:text-white transition-colors duration-300 px-8 py-6 text-lg font-medium rounded-md group"
            >
              Voir toutes les formations
              <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 