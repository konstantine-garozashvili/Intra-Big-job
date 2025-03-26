import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { ChartContainer, ChartTooltip } from "../../components/ui/chart";
import { 
    Calendar, 
    ChevronLeft, 
    Clock, 
    Download, 
    Info, 
    Upload, 
    UserCheck, 
    AlertTriangle,
    CheckCircle,
    Clock3,
    ArrowRight,
    ArrowUpDown,
    Filter
} from 'lucide-react';
import { Badge } from "../../components/ui/badge";
import { ChartLegend, ChartLegendContent } from "../../components/ui/chart";
import * as RechartsPrimitive from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";

// Données fictives pour les absences
const absencesData = [
    {
        id: 1,
        courseName: "Développement Web Avancé",
        date: "2025-02-15",
        startTime: "08:30",
        endTime: "12:30",
        status: "Non justifiée",
        justification: null,
        documentPath: null
    },
    {
        id: 2,
        courseName: "Bases de données",
        date: "2025-01-20",
        startTime: "14:00",
        endTime: "18:00",
        status: "Justifiée",
        justification: "Certificat médical",
        documentPath: "/documents/certificat_medical_20250120.pdf"
    },
    {
        id: 3,
        courseName: "Mathématiques pour l'informatique",
        date: "2025-02-05",
        startTime: "08:30",
        endTime: "12:30",
        status: "En attente",
        justification: "Rendez-vous administratif",
        documentPath: "/documents/convocation_20250205.pdf"
    },
    {
        id: 4,
        courseName: "Anglais technique",
        date: "2025-02-20",
        startTime: "14:00",
        endTime: "16:00",
        status: "Justifiée",
        justification: "Participation à un événement universitaire",
        documentPath: "/documents/attestation_evenement_20250220.pdf"
    },
    {
        id: 5,
        courseName: "Développement mobile",
        date: "2025-03-01",
        startTime: "08:30",
        endTime: "12:30",
        status: "Non justifiée",
        justification: null,
        documentPath: null
    }
];

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: "spring", stiffness: 400, damping: 25 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

// Fonction pour formater la date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
};

// Fonction pour formater la date en version courte
const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: fr });
};

// Fonction pour calculer le total des heures d'absence
const calculateTotalHours = () => {
    return absencesData.reduce((total, absence) => total + absence.duration, 0);
};

// Fonction pour calculer le nombre d'absences par statut
const calculateAbsencesByStatus = () => {
    const statusCount = {
        "Justifiée": 0,
        "Non justifiée": 0,
        "En attente": 0
    };

    absencesData.forEach(absence => {
        statusCount[absence.status]++;
    });

    return [
        { name: "Justifiée", value: statusCount["Justifiée"], color: "#10b981" },
        { name: "Non justifiée", value: statusCount["Non justifiée"], color: "#ef4444" },
        { name: "En attente", value: statusCount["En attente"], color: "#f59e0b" }
    ];
};

const Absences = () => {
    const [selectedAbsence, setSelectedAbsence] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const navigate = useNavigate();

    // Données pour le graphique
    const absencesByStatus = calculateAbsencesByStatus();
    const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

    // Statistiques
    const stats = [
        {
            title: "Total des absences",
            value: absencesData.length,
            description: "Nombre d'absences enregistrées",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            icon: Calendar
        },
        {
            title: "Heures manquées",
            value: `10h`,
            description: "Total des heures d'absence",
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            icon: Clock
        },
        {
            title: "Absences justifiées",
            value: `${absencesData.filter(a => a.status === "Justifiée").length}`,
            description: "Nombre d'absences justifiées",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            icon: UserCheck
        },
        {
            title: "En attente",
            value: `${absencesData.filter(a => a.status === "En attente").length}`,
            description: "Absences en attente de justification",
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            icon: Clock3
        }
    ];

    // Effet pour simuler le chargement
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Filtrer les absences selon le statut
    const filteredAbsences = absencesData.filter(absence => {
        if (statusFilter === "all") return true;
        return absence.status === statusFilter;
    });

    // Ouvrir le dialogue avec les détails de l'absence
    const openAbsenceDetails = (absence) => {
        setSelectedAbsence(absence);
        setDialogOpen(true);
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        >
            <div className="container p-4 mx-auto max-w-7xl">
                {/* Header with back button */}
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
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                            Suivi des absences
                        </h1>
                        <p className="text-muted-foreground">Gérez vos absences et justificatifs</p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {stats.map((stat, index) => (
                        <motion.div key={stat.title} variants={itemVariants}>
                            <Card className="relative overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/40 dark:to-black/0 z-10"></div>
                                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/0 dark:from-white/5 dark:to-white/0"></div>
                                <CardHeader className="relative z-20">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-3 rounded-xl ${stat.bgColor} transform group-hover:scale-110 transition-transform duration-300`}>
                                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            <span className={`text-3xl font-bold ${stat.color}`}>
                                                {stat.value}
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-20 pt-0">
                                    <h3 className="font-semibold text-lg mb-1">{stat.title}</h3>
                                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Chart and Table side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                    {/* Chart Card */}
                    <motion.div 
                        variants={cardVariants}
                        className="lg:col-span-4"
                    >
                        <Card className="overflow-hidden border-none shadow-md h-full">
                            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                                        <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Répartition des absences</CardTitle>
                                        <CardDescription>Vue d'ensemble des absences par statut</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center h-[400px]">
                                {isLoading ? (
                                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ChartContainer
                                            config={{
                                                "Justifiée": {
                                                    theme: {
                                                        light: "#10b981",
                                                        dark: "#10b981"
                                                    }
                                                },
                                                "Non justifiée": {
                                                    theme: {
                                                        light: "#ef4444",
                                                        dark: "#ef4444"
                                                    }
                                                },
                                                "En attente": {
                                                    theme: {
                                                        light: "#f59e0b",
                                                        dark: "#f59e0b"
                                                    }
                                                }
                                            }}
                                            className="w-full h-full"
                                        >
                                            <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
                                                <RechartsPrimitive.PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                                    <RechartsPrimitive.Pie
                                                        data={calculateAbsencesByStatus()}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, value }) => `${value}`}
                                                        labelLine={false}
                                                    >
                                                        {calculateAbsencesByStatus().map((entry, index) => (
                                                            <RechartsPrimitive.Cell 
                                                                key={`cell-${index}`}
                                                                fill={entry.color}
                                                                className="stroke-background hover:opacity-80 transition-opacity duration-200"
                                                            />
                                                        ))}
                                                    </RechartsPrimitive.Pie>
                                                    <RechartsPrimitive.Legend 
                                                        layout="vertical" 
                                                        verticalAlign="middle" 
                                                        align="right"
                                                        iconType="circle"
                                                        wrapperStyle={{ paddingLeft: 0 }}
                                                        payload={calculateAbsencesByStatus().map(item => ({
                                                            value: item.name,
                                                            type: 'circle',
                                                            color: item.color,
                                                            id: item.name
                                                        }))}
                                                        formatter={(value) => (
                                                            <span className="text-sm font-medium">
                                                                {value}
                                                            </span>
                                                        )}
                                                    />
                                                    <ChartTooltip
                                                        content={({ active, payload }) => {
                                                            if (!active || !payload?.length) return null;
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <div 
                                                                            className="h-2 w-2 rounded-full"
                                                                            style={{ backgroundColor: data.color }}
                                                                        />
                                                                        <span className="font-medium">{data.name}</span>
                                                                        <span>: {data.value}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                </RechartsPrimitive.PieChart>
                                            </RechartsPrimitive.ResponsiveContainer>
                                        </ChartContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Table with Filter */}
                    <motion.div variants={cardVariants} className="lg:col-span-8">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Liste des absences</CardTitle>
                                        <CardDescription>
                                            Toutes vos absences pour l'année académique 2024-2025
                                        </CardDescription>
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filtrer par statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les statuts</SelectItem>
                                            <SelectItem value="Justifiée">Justifiées</SelectItem>
                                            <SelectItem value="Non justifiée">Non justifiées</SelectItem>
                                            <SelectItem value="En attente">En attente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-auto max-h-[350px] scrollbar-hide">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10">
                                            <TableRow>
                                                <TableHead className="w-[30%]">Cours</TableHead>
                                                <TableHead className="w-[15%]">Date</TableHead>
                                                <TableHead className="w-[15%]">Horaire</TableHead>
                                                <TableHead className="w-[12%]">Statut</TableHead>
                                                <TableHead className="w-[20%] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAbsences.length > 0 ? (
                                                filteredAbsences.map((absence) => (
                                                    <TableRow key={absence.id}>
                                                        <TableCell className="font-medium truncate max-w-[200px]">{absence.courseName}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{formatShortDate(absence.date)}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{absence.startTime} - {absence.endTime}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                absence.status === "Justifiée" ? "success" :
                                                                absence.status === "Non justifiée" ? "destructive" : "warning"
                                                            }>
                                                                {absence.status === "Non justifiée" ? "Non just." : absence.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-wrap gap-2 justify-end">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openAbsenceDetails(absence)}
                                                                >
                                                                    Détails
                                                                </Button>
                                                                {absence.status === "Non justifiée" && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                                                    >
                                                                        Justifier
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-4">
                                                        Aucune absence trouvée.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t">
                                <div className="text-sm text-gray-500">
                                    Total: {filteredAbsences.length} absence(s)
                                </div>
                                <Button variant="outline">
                                    Télécharger le récapitulatif
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>

                {/* Dialogue de détails d'absence */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Détails de l'absence</DialogTitle>
                            <DialogDescription>
                                Informations détaillées sur l'absence sélectionnée
                            </DialogDescription>
                        </DialogHeader>
                        {selectedAbsence && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Cours</h3>
                                        <p className="mt-1 text-sm">{selectedAbsence.courseName}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Date</h3>
                                        <p className="mt-1 text-sm">{formatDate(selectedAbsence.date)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Horaire</h3>
                                        <p className="mt-1 text-sm">{selectedAbsence.startTime} - {selectedAbsence.endTime}</p>
                                    </div>
                                    <div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                                        <p className="mt-1 text-sm">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedAbsence.status === "Justifiée"
                                                    ? "bg-green-100 text-green-800"
                                                    : selectedAbsence.status === "Non justifiée"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-amber-100 text-amber-800"
                                                }`}>
                                                {selectedAbsence.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {selectedAbsence.justification && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Justification</h3>
                                        <p className="mt-1 text-sm">{selectedAbsence.justification}</p>
                                    </div>
                                )}

                                {selectedAbsence.documentPath && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Document justificatif</h3>
                                        <div className="mt-1">
                                            <Button variant="outline" size="sm" className="text-blue-600">
                                                Télécharger le document
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Fermer
                            </Button>
                            {selectedAbsence && selectedAbsence.status === "Non justifiée" && (
                                <Button className="bg-green-600 hover:bg-green-700">
                                    Justifier cette absence
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </motion.div>
    );
};

export default Absences; 