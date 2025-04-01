import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  ArrowLeft,
  Clock,
  MapPin,
  User,
  BookOpen,
  Presentation,
  GraduationCap,
  Laptop
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Animation variants
const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const courseVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25
    }
  }
};

const Schedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Données mockées des cours avec plus de détails
    const courses = [
        {
            id: 1,
            name: 'Développement Web',
            professor: 'M. Martin',
            professorImage: null,
            room: 'Salle A101',
            startTime: '09:00',
            endTime: '10:30',
            day: 1,
            type: 'CM',
            color: 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
            description: 'Introduction aux frameworks modernes',
            materials: ['Slides', 'TP Instructions'],
            attendance: 25
        },
        {
            id: 2,
            name: 'Base de données',
            professor: 'Mme Bernard',
            professorImage: null,
            room: 'Salle B202',
            startTime: '11:00',
            endTime: '12:30',
            day: 1,
            type: 'TD',
            color: 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700',
            description: 'Modélisation et requêtes SQL',
            materials: ['Exercices', 'Documentation'],
            attendance: 18
        },
        {
            id: 3,
            name: 'Cybersécurité',
            professor: 'M. Dubois',
            professorImage: null,
            room: 'Salle C303',
            startTime: '14:00',
            endTime: '17:00',
            day: 2,
            type: 'TP',
            color: 'bg-purple-100 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700',
            description: 'Sécurisation des applications web',
            materials: ['Lab Guide', 'Resources'],
            attendance: 22
        }
    ];

    const hours = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    const weekDays = Array.from({ length: 5 }, (_, i) => {
        const date = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i);
        return {
            date,
            name: format(date, 'EEEE', { locale: fr }),
            shortName: format(date, 'EEE', { locale: fr }),
            fullDate: format(date, 'd MMMM', { locale: fr })
        };
    });

    const getCoursesForDay = (day) => courses.filter(course => course.day === day);

    const getCourseStyle = (startTime, endTime) => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startPosition = (startHour - 8) * 60 + startMinute;
        const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
        return {
            top: `${startPosition}px`,
            height: `${duration}px`,
        };
    };

    const previousWeek = () => setCurrentDate(prev => addDays(prev, -7));
    const nextWeek = () => setCurrentDate(prev => addDays(prev, 7));

    const getTypeIcon = (type) => {
        switch(type) {
            case 'CM': return Presentation;
            case 'TD': return BookOpen;
            case 'TP': return Laptop;
            default: return GraduationCap;
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className="container p-4 sm:p-6 lg:p-8 mx-auto min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                {/* En-tête avec navigation */}
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link to="/student/dashboard">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <CardTitle>Emploi du temps</CardTitle>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={previousWeek}
                                variant="outline"
                                size="sm"
                                className="h-8"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                            </Button>
                            <div className="px-3 py-1.5 rounded-lg bg-primary/5 dark:bg-primary/10">
                                <span className="text-sm font-medium">
                                    Semaine du {format(weekDays[0].date, 'd MMMM', { locale: fr })}
                                </span>
                            </div>
                            <Button
                                onClick={nextWeek}
                                variant="outline"
                                size="sm"
                                className="h-8"
                            >
                                Suivant
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-12rem)]">
                        <div className="grid grid-cols-6 divide-x divide-gray-100 dark:divide-gray-700">
                            {/* Colonne des heures */}
                            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-2 sticky left-0 z-10">
                                <div className="h-20 flex items-end justify-center">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                </div>
                                {hours.map((hour) => (
                                    <div
                                        key={hour}
                                        className="h-[60px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400"
                                    >
                                        {hour}
                                    </div>
                                ))}
                            </div>

                            {/* Colonnes des jours */}
                            {weekDays.map((day, index) => (
                                <div key={day.name} className="relative">
                                    <div className={`h-20 p-4 text-center sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 ${
                                        isSameDay(day.date, new Date()) ? 'bg-primary/5 dark:bg-primary/10' : ''
                                    }`}>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{day.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{day.fullDate}</p>
                                    </div>
                                    <div className="relative h-[660px]">
                                        {/* Lignes des heures */}
                                        {hours.map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-full h-[60px]"
                                                style={{ top: `${i * 60}px` }}
                                            >
                                                <div className="border-t border-gray-100 dark:border-gray-800 w-full h-full"></div>
                                            </div>
                                        ))}

                                        {/* Cours du jour */}
                                        <AnimatePresence>
                                            {getCoursesForDay(index + 1).map((course) => {
                                                const TypeIcon = getTypeIcon(course.type);
                                                return (
                                                    <motion.div
                                                        key={course.id}
                                                        variants={courseVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="hidden"
                                                        whileHover={{ scale: 1.02 }}
                                                        className={`absolute w-[95%] left-[2.5%] rounded-lg border ${course.color} shadow-sm backdrop-blur-sm`}
                                                        style={getCourseStyle(course.startTime, course.endTime)}
                                                    >
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="p-2 h-full cursor-pointer">
                                                                        <div className="flex items-start justify-between mb-1">
                                                                            <span className="font-medium text-sm line-clamp-1">{course.name}</span>
                                                                            <Badge variant="secondary" className="ml-1 shrink-0">
                                                                                <TypeIcon className="h-3 w-3 mr-1" />
                                                                                {course.type}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                                                <User className="h-3 w-3" />
                                                                                {course.professor}
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                                                <MapPin className="h-3 w-3" />
                                                                                {course.room}
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                                                <Clock className="h-3 w-3" />
                                                                                {course.startTime} - {course.endTime}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="p-4 max-w-xs">
                                                                    <div className="space-y-2">
                                                                        <h4 className="font-medium">{course.name}</h4>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
                                                                        <div className="flex items-center gap-2 pt-2">
                                                                            <Avatar className="h-6 w-6">
                                                                                <AvatarFallback>
                                                                                    {course.professor.split(' ').map(n => n[0]).join('')}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="text-sm">{course.professor}</span>
                                                                        </div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Légende */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <Badge variant="outline" className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
                    <Presentation className="h-3.5 w-3.5 mr-1.5" />
                    CM - Cours Magistral
                </Badge>
                <Badge variant="outline" className="px-3 py-1 bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    TD - Travaux Dirigés
                </Badge>
                <Badge variant="outline" className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700">
                    <Laptop className="h-3.5 w-3.5 mr-1.5" />
                    TP - Travaux Pratiques
                </Badge>
            </div>
        </motion.div>
    );
};

export { Schedule as default }; 