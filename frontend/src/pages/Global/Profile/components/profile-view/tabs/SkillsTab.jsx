import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { CodeIcon, StarIcon } from "lucide-react";

const SkillsTab = ({ userData }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        duration: 0.5
      }
    }
  };

  // Animation pour les badges de compétences
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200 }
    }
  };

  return (
    <>
      {/* Compétences */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <CodeIcon className="h-5 w-5 text-primary" />
              Compétences
            </CardTitle>
            <CardDescription>
              {userData.role === "STUDENT" 
                ? "Compétences techniques et personnelles"
                : "Expertises techniques et domaines de compétence"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Pour les rôles non étudiants, on affiche les niveaux d'expertise */}
            {userData.role !== "STUDENT" && (
              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-medium text-primary">Niveaux d'expertise</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">PHP & Symfony</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star} 
                            className={`h-5 w-5 ${star <= 5 ? "text-amber-500" : "text-gray-300"}`} 
                            fill={star <= 5 ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full" style={{width: "95%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">JavaScript</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star} 
                            className={`h-5 w-5 ${star <= 4 ? "text-amber-500" : "text-gray-300"}`} 
                            fill={star <= 4 ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full" style={{width: "85%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Database Design</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star} 
                            className={`h-5 w-5 ${star <= 5 ? "text-amber-500" : "text-gray-300"}`} 
                            fill={star <= 5 ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full" style={{width: "90%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Docker & DevOps</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star} 
                            className={`h-5 w-5 ${star <= 4 ? "text-amber-500" : "text-gray-300"}`} 
                            fill={star <= 4 ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full" style={{width: "80%"}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Pour les étudiants, on affiche un message indiquant que les compétences ne sont pas encore disponibles */}
            {userData.role === "STUDENT" && (
              <div className="text-center py-8 text-muted-foreground">
                Les compétences seront bientôt disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Recommandations */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-primary" />
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-700/30 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:shadow-md">
              <div className="flex items-start gap-4">
                <Avatar className="border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">MR</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-primary">Marie Robert</h3>
                  <p className="text-sm text-muted-foreground">Directrice technique chez TechSolutions</p>
                  <p className="mt-2 text-sm">
                    {userData.role === "STUDENT" 
                      ? "John a fait preuve d'une grande capacité d'adaptation et d'apprentissage pendant son stage. Il a rapidement pris en main les technologies et a contribué efficacement aux projets." 
                      : "Un excellent professionnel, avec une grande maîtrise technique et une capacité à transmettre son savoir de manière claire et pédagogique."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-700/30 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:shadow-md">
              <div className="flex items-start gap-4">
                <Avatar className="border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">PL</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-primary">Philippe Legrand</h3>
                  <p className="text-sm text-muted-foreground">
                    {userData.role === "STUDENT" 
                      ? "Formateur en Développement Web" 
                      : "Directeur des Études"}
                  </p>
                  <p className="mt-2 text-sm">
                    {userData.role === "STUDENT" 
                      ? "Un étudiant sérieux et impliqué qui a su démontrer sa passion pour le développement web et sa capacité à résoudre des problèmes complexes." 
                      : "Une référence dans son domaine, toujours à jour sur les dernières évolutions technologiques et capable d'inspirer ses élèves."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-0">
            <Button 
              variant="outline" 
              className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              Voir toutes les recommandations
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
};

export default SkillsTab; 