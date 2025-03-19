import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Download, TrendingUp, Award, Calendar, 
    BookOpen, CheckCircle2, Target, Zap, Bookmark, Star
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";

// Données fictives pour les notes des cours
const courseGrades = [
    {
        id: 1,
        courseName: "Développement Web Avancé",
        subject: "Informatique",
        type: "Examen",
        date: "2025-02-15",
        value: 17.5,
        maxValue: 20,
        comment: "Excellent travail sur le projet React"
    },
    {
        id: 2,
        courseName: "Développement Web Avancé",
        subject: "Informatique",
        type: "TP",
        date: "2025-01-20",
        value: 16,
        maxValue: 20,
        comment: "Bonne maîtrise des concepts"
    },
    {
        id: 3,
        courseName: "Bases de données",
        subject: "Informatique",
        type: "Examen",
        date: "2025-02-10",
        value: 15,
        maxValue: 20,
        comment: "Bonnes connaissances en SQL"
    },
    {
        id: 4,
        courseName: "Bases de données",
        subject: "Informatique",
        type: "TP",
        date: "2025-01-25",
        value: 18,
        maxValue: 20,
        comment: "Excellent modèle de données"
    },
    {
        id: 5,
        courseName: "Mathématiques pour l'informatique",
        subject: "Mathématiques",
        type: "Examen",
        date: "2025-02-05",
        value: 14,
        maxValue: 20,
        comment: "Bonne compréhension des concepts"
    },
    {
        id: 6,
        courseName: "Anglais technique",
        subject: "Langues",
        type: "Oral",
        date: "2025-02-20",
        value: 16,
        maxValue: 20,
        comment: "Bonne présentation et vocabulaire technique"
    }
];

// Données fictives pour les notes des projets
const projectGrades = [
    {
        id: 1,
        projectName: "Projet Intranet",
        courseName: "Développement Web Avancé",
        type: "Projet de groupe",
        date: "2025-03-01",
        value: 18,
        maxValue: 20,
        comment: "Excellent travail d'équipe et fonctionnalités complètes"
    },
    {
        id: 2,
        projectName: "Système de gestion de base de données",
        courseName: "Bases de données",
        type: "Projet individuel",
        date: "2025-02-25",
        value: 17,
        maxValue: 20,
        comment: "Très bonne conception et implémentation"
    },
    {
        id: 3,
        projectName: "Application mobile",
        courseName: "Développement mobile",
        type: "Projet de groupe",
        date: "2025-03-10",
        value: 16.5,
        maxValue: 20,
        comment: "Interface utilisateur intuitive et bonnes fonctionnalités"
    }
];

// Calcul des moyennes par matière
const calculateAverages = () => {
    const subjects = {};

    courseGrades.forEach(grade => {
        if (!subjects[grade.subject]) {
            subjects[grade.subject] = {
                total: 0,
                count: 0,
                average: 0
            };
        }

        subjects[grade.subject].total += (grade.value / grade.maxValue) * 20;
        subjects[grade.subject].count += 1;
    });

    // Calcul des moyennes
    Object.keys(subjects).forEach(subject => {
        subjects[subject].average = subjects[subject].total / subjects[subject].count;
    });

    return subjects;
};

// Add this function before the Grades component
const calculateOverallAverage = () => {
    let total = 0;
    let count = 0;

    courseGrades.forEach(grade => {
        total += (grade.value / grade.maxValue) * 20;
        count += 1;
    });

    return (total / count).toFixed(2);
};

// Données pour les compétences acquises
const skillsData = [
    { 
        name: "Développement Web", 
        progress: 85, 
        icon: <Zap className="w-5 h-5 text-purple-500" />,
        color: "from-purple-500 to-purple-400"
    },
    { 
        name: "Bases de données", 
        progress: 78, 
        icon: <Target className="w-5 h-5 text-blue-500" />,
        color: "from-blue-500 to-blue-400"
    },
    { 
        name: "Mathématiques", 
        progress: 70, 
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        color: "from-green-500 to-green-400"
    },
    { 
        name: "Langues", 
        progress: 80, 
        icon: <BookOpen className="w-5 h-5 text-amber-500" />,
        color: "from-amber-500 to-amber-400"
    },
];

// Données pour les objectifs
const objectivesData = [
    { 
        name: "Améliorer les compétences en mathématiques", 
        progress: 70, 
        deadline: "Juin 2025",
        color: "from-green-500 to-green-400"
    },
    { 
        name: "Maîtriser React et Next.js", 
        progress: 85, 
        deadline: "Mai 2025",
        color: "from-blue-500 to-blue-400"
    },
    { 
        name: "Obtenir la certification en bases de données", 
        progress: 60, 
        deadline: "Juillet 2025",
        color: "from-amber-500 to-amber-400"
    },
];

const Grades = () => {
    const [activeTab, setActiveTab] = useState("courses");
    const averages = calculateAverages();
    const navigate = useNavigate();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    // Calculate overall average
    const overallAverage = calculateOverallAverage();
    const bestGrade = Math.max(...courseGrades.map(grade => grade.value));
    const upcomingExams = 3;

    // Animation variants for tab content
    const tabContentVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.2,
                ease: "easeOut"
            }
        },
        exit: { 
            opacity: 0,
            y: -10,
            transition: { 
                duration: 0.15,
                ease: "easeIn"
            }
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        >
            <div className="container p-4 mx-auto max-w-7xl">
                {/* Header */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-4 mb-8"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/student/dashboard')}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                            Notes et résultats
                        </h1>
                        <p className="text-muted-foreground">Consultez et analysez vos performances académiques</p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/20 dark:to-blue-800/10 backdrop-blur-sm h-full">
                            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 rounded-full bg-blue-500/10 dark:bg-blue-400/10"></div>
                            <CardHeader className="space-y-1 border-b border-gray-100/20 dark:border-gray-700/20">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                        <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <CardTitle className="text-xl">Moyenne générale</CardTitle>
                                </div>
                                <CardDescription>Performance globale</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center">
                                    <div className="relative">
                                        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                                            {overallAverage}
                                        </div>
                                        <div className="absolute -top-2 -right-6 text-lg text-gray-400">/20</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="h-2.5 w-full rounded-full bg-blue-100/50 dark:bg-blue-900/20 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${parseFloat(overallAverage) * 5}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-900/20 dark:to-green-800/10 backdrop-blur-sm h-full">
                            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 rounded-full bg-green-500/10 dark:bg-green-400/10"></div>
                            <CardHeader className="space-y-1 border-b border-gray-100/20 dark:border-gray-700/20">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                        <Award className="w-5 h-5 text-green-500 dark:text-green-400" />
                                    </div>
                                    <CardTitle className="text-xl">Meilleure note</CardTitle>
                                </div>
                                <CardDescription>Note la plus élevée</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center">
                                    <div className="relative">
                                        <div className="text-6xl font-bold text-green-600 dark:text-green-400">
                                            {bestGrade}
                                        </div>
                                        <div className="absolute -top-2 -right-6 text-lg text-gray-400">/20</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="h-2.5 w-full rounded-full bg-green-100/50 dark:bg-green-900/20 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${bestGrade * 5}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-900/20 dark:to-amber-800/10 backdrop-blur-sm h-full">
                            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 rounded-full bg-amber-500/10 dark:bg-amber-400/10"></div>
                            <CardHeader className="space-y-1 border-b border-gray-100/20 dark:border-gray-700/20">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                        <Calendar className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                    </div>
                                    <CardTitle className="text-xl">Notes à venir</CardTitle>
                                </div>
                                <CardDescription>Examens prévus</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center">
                                    <div className="text-6xl font-bold text-amber-600 dark:text-amber-400">
                                        {upcomingExams}
                                    </div>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Mathématiques</span>
                                        <span className="text-muted-foreground">28 Mai</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Développement Web</span>
                                        <span className="text-muted-foreground">2 Juin</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Anglais</span>
                                        <span className="text-muted-foreground">10 Juin</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Compétences et Objectifs (remplace le graphique) */}
                <motion.div variants={itemVariants} className="mb-8">
                    <Card className="overflow-hidden border-none shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-blue-500" />
                                Progression et compétences
                            </CardTitle>
                            <CardDescription>
                                Visualisez votre progression et vos compétences acquises
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {/* Compétences acquises */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium">Compétences acquises</h3>
                                    <div className="space-y-4">
                                        {skillsData.map((skill, index) => (
                                            <motion.div 
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {skill.icon}
                                                        <span>{skill.name}</span>
                                                    </div>
                                                    <span className="font-medium">{skill.progress}%</span>
                                                </div>
                                                <div className="h-2.5 w-full rounded-full bg-gray-200/50 dark:bg-gray-700/40 overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${skill.progress}%` }}
                                                        transition={{ 
                                                            duration: 1, 
                                                            ease: "easeOut",
                                                            delay: index * 0.1 + 0.2
                                                        }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Objectifs */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium">Objectifs académiques</h3>
                                    <div className="space-y-6">
                                        {objectivesData.map((objective, index) => (
                                            <motion.div 
                                                key={index}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{objective.name}</span>
                                                    <Badge variant="outline">{objective.deadline}</Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2.5 flex-1 rounded-full bg-gray-200/50 dark:bg-gray-700/40 overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${objective.progress}%` }}
                                                            transition={{ 
                                                                duration: 1, 
                                                                ease: "easeOut",
                                                                delay: index * 0.1 + 0.2
                                                            }}
                                                            className={`h-full rounded-full bg-gradient-to-r ${objective.color} relative`}
                                                        >
                                                            <span className="absolute -right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 rounded-full bg-white dark:bg-gray-800 border-2 border-current"></span>
                                                        </motion.div>
                                                    </div>
                                                    <span className="text-sm font-medium w-10 text-right">{objective.progress}%</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs Section */}
                <motion.div variants={itemVariants}>
                    <Tabs defaultValue="courses" onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2 h-12">
                            <TabsTrigger value="courses" className="text-sm">Notes des cours</TabsTrigger>
                            <TabsTrigger value="projects" className="text-sm">Notes des projets</TabsTrigger>
                        </TabsList>

                        <div className="relative">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={activeTab}
                                    variants={tabContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute w-full"
                                >
                                    {activeTab === "courses" && (
                                        <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                                                <CardTitle>Notes des cours</CardTitle>
                                                <CardDescription>
                                                    Consultez vos notes pour chaque cours et examen
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <ScrollArea className="h-[500px] w-full">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Cours</TableHead>
                                                                <TableHead>Matière</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead className="text-right">Note</TableHead>
                                                                <TableHead>Commentaire</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {courseGrades.map((grade) => (
                                                                <TableRow 
                                                                    key={grade.id}
                                                                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                                                                >
                                                                    <TableCell className="font-medium">{grade.courseName}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="font-normal">
                                                                            {grade.subject}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>{grade.type}</TableCell>
                                                                    <TableCell>{new Date(grade.date).toLocaleDateString('fr-FR')}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge variant={
                                                                            grade.value >= 16 ? "success" :
                                                                            grade.value >= 12 ? "default" :
                                                                            grade.value >= 10 ? "warning" : "destructive"
                                                                        }>
                                                                            {grade.value}/{grade.maxValue}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="max-w-xs truncate">{grade.comment}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {activeTab === "projects" && (
                                        <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                                                <CardTitle>Notes des projets</CardTitle>
                                                <CardDescription>
                                                    Consultez vos notes pour chaque projet
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <ScrollArea className="h-[500px] w-full">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Projet</TableHead>
                                                                <TableHead>Cours associé</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead className="text-right">Note</TableHead>
                                                                <TableHead>Commentaire</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {projectGrades.map((grade) => (
                                                                <TableRow 
                                                                    key={grade.id}
                                                                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                                                                >
                                                                    <TableCell className="font-medium">{grade.projectName}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="font-normal">
                                                                            {grade.courseName}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>{grade.type}</TableCell>
                                                                    <TableCell>{new Date(grade.date).toLocaleDateString('fr-FR')}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge variant={
                                                                            grade.value >= 16 ? "success" :
                                                                            grade.value >= 12 ? "default" :
                                                                            grade.value >= 10 ? "warning" : "destructive"
                                                                        }>
                                                                            {grade.value}/{grade.maxValue}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="max-w-xs truncate">{grade.comment}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </ScrollArea>
                                            </CardContent>
                                            <CardFooter className="border-t border-gray-100 dark:border-gray-700">
                                                <Button variant="outline" className="ml-auto gap-2">
                                                    <Download className="w-4 h-4" />
                                                    Télécharger le relevé
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Spacer div to maintain layout height */}
                            <div className={`${activeTab === "courses" ? "h-[590px]" : "h-[630px]"} invisible`}></div>
                        </div>
                    </Tabs>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Grades; 