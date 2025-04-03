import React, { useState, useEffect, useMemo, useContext } from "react";
import { CheckCircle2, XCircle, InfoIcon, ExternalLinkIcon, PieChart, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ProfileContext } from "@/components/MainLayout";

const ProfileProgress = () => {
  console.log("[ProfileProgress] Rendering.");

  const [isOpen, setIsOpen] = useState(false);
  const { refreshProfileData, isProfileLoading, profileData } = useContext(ProfileContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("[ProfileProgress] Received from Context:", JSON.stringify(profileData, null, 2));

  console.log("[ProfileProgress] Context profileData:", profileData);

  const { completedItems, completionItems } = useMemo(() => {
    console.log("[ProfileProgress] Memo: Calculating completion items based on profileData:", profileData);

    if (!profileData) {
      console.log("[ProfileProgress] Memo: profileData is null/undefined.");
      return { completedItems: 0, completionItems: [] };
    }

    const hasLinkedIn = Boolean(profileData?.linkedinUrl);
    const hasCv = Boolean(profileData?.hasCvDocument);
    const hasDiploma = Boolean(profileData?.diplomas?.length > 0);
    
    const items = [
      { 
        name: 'LinkedIn', 
        completed: hasLinkedIn,
        description: "Votre profil LinkedIn permet aux recruteurs de mieux vous connaître.",
        action: "/settings/profile"
      },
      { 
        name: 'CV', 
        completed: hasCv,
        description: "Votre CV est essentiel pour présenter votre parcours.",
        action: "/settings/career"
      },
      { 
        name: 'Diplôme', 
        completed: hasDiploma,
        description: "Vos diplômes certifient vos qualifications.",
        action: "/settings/career"
      }
    ].sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    });

    const completed = [hasLinkedIn, hasCv, hasDiploma].filter(Boolean).length;

    return { completedItems: completed, completionItems: items };
  }, [profileData]);

  const handleRefresh = async () => {
    if (isRefreshing || isProfileLoading) return;
    
    setIsRefreshing(true);
    try {
      await refreshProfileData();
    } catch (error) {
      console.error("[ProfileProgress] Error during refresh:", error);
    } finally {
    }
  };

  useEffect(() => {
    if (!isProfileLoading && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [isProfileLoading, isRefreshing]);

  console.log("[ProfileProgress] Rendering UI. Percentage:", profileData ? Math.round((completedItems / 3) * 100) : 0, "Items:", completionItems);

  const showLoadingState = (isProfileLoading && !profileData) || isRefreshing;

  if (showLoadingState) {
    console.log("[ProfileProgress] Rendering loading state.");
    return (
      <button
        className="fixed right-8 bottom-8 z-20 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        disabled
      >
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="font-medium">Chargement...</span>
      </button>
    );
  }

  if (!profileData) {
    console.log("[ProfileProgress] Rendering empty state (no profile data after load attempt).");
    return null;
  }

  const percentage = Math.round((completedItems / 3) * 100);
  const itemsToComplete = 3 - completedItems;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-8 bottom-8 z-20 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg ${
          isOpen 
            ? 'bg-background text-foreground hover:bg-muted' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        <PieChart className="w-5 h-5" />
        <span className="font-medium">
          {itemsToComplete === 0 
            ? "Profil complet ✨" 
            : `${itemsToComplete} élément${itemsToComplete > 1 ? 's' : ''} à compléter`}
        </span>
      </button>

      {isOpen && (
        <div className="fixed right-8 bottom-24 w-80 z-10">
          <div className="bg-background/80 backdrop-blur-lg rounded-xl shadow-lg border border-border/5 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">Complétude du profil</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-center rounded-full w-4 h-4 text-muted-foreground hover:text-primary transition-colors">
                        <InfoIcon className="w-3 h-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                      <p className="text-xs text-muted-foreground">
                        Complétez ces informations pour augmenter la visibilité de votre profil auprès des recruteurs.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || isProfileLoading}
                    className="inline-flex items-center justify-center rounded-full w-6 h-6 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    title="Actualiser"
                  >
                    <RefreshCw className={`w-4 h-4 ${(isRefreshing || isProfileLoading) ? 'animate-spin' : ''}`} />
                  </button>
                  <span className="text-sm font-medium">
                    {completedItems}/3
                  </span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5 mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className={`space-y-2 transition-opacity duration-300 ${(isRefreshing || isProfileLoading) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {completionItems.map((item) => {
                  return (
                    <div 
                      key={item.name}
                      className={`flex items-start gap-3 p-2 rounded-lg transition-colors duration-300 ${
                        item.completed 
                          ? 'bg-green-50/50 dark:bg-green-900/10' 
                          : 'bg-red-50/50 dark:bg-red-900/10'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-300 ${
                        item.completed 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}>
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          {!item.completed && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              asChild
                            >
                              <a href={item.action} className="flex items-center gap-1">
                                Compléter
                                <ExternalLinkIcon className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                        {item.name === 'CV' && item.completed && (
                          <Button
                            variant="outline"
                            size="xs"
                            className="mt-2 h-6 px-2 text-xs w-full justify-center"
                            onClick={() => console.log("Parse CV clicked!")}
                          >
                            Extraire LinkedIn du CV
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileProgress;