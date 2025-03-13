import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Données fictives pour les absences
const absencesData = [
    {
        id: 1,
        courseName: "Développement Web Avancé",
        date: "2025-02-15",
        startTime: "08:30",
        endTime: "12:30",
        duration: 4,
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
        duration: 4,
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
        duration: 4,
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
        duration: 2,
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
        duration: 4,
        status: "Non justifiée",
        justification: null,
        documentPath: null
    }
];

// Fonction pour formater la date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
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
        { name: "Justifiée", value: statusCount["Justifiée"] },
        { name: "Non justifiée", value: statusCount["Non justifiée"] },
        { name: "En attente", value: statusCount["En attente"] }
    ];
};

const Absences = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [selectedAbsence, setSelectedAbsence] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Données pour le graphique
    const absencesByStatus = calculateAbsencesByStatus();
    const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

    // Filtrer les absences en fonction de l'onglet actif
    const filteredAbsences = absencesData.filter(absence => {
        if (activeTab === "all") return true;
        return absence.status.toLowerCase() === activeTab;
    });

    // Ouvrir le dialogue avec les détails de l'absence
    const openAbsenceDetails = (absence) => {
        setSelectedAbsence(absence);
        setDialogOpen(true);
    };

    return (
        <div className="container p-8 mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h1 className="mb-4 text-3xl font-bold text-gray-800">
                    Suivi des absences
                </h1>

                <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total des absences</CardTitle>
                            <CardDescription>Nombre d'absences enregistrées</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-center text-blue-600">
                                {absencesData.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Heures manquées</CardTitle>
                            <CardDescription>Total des heures d'absence</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-center text-amber-600">
                                {calculateTotalHours()}h
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Taux de justification</CardTitle>
                            <CardDescription>Pourcentage d'absences justifiées</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-center text-green-600">
                                {Math.round((absencesByStatus.find(a => a.name === "Justifiée").value / absencesData.length) * 100)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition des absences</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={absencesByStatus}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {absencesByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, 'Nombre d\'absences']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Tabs defaultValue="all" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">Toutes</TabsTrigger>
                            <TabsTrigger value="justifiée">Justifiées</TabsTrigger>
                            <TabsTrigger value="non justifiée">Non justifiées</TabsTrigger>
                            <TabsTrigger value="en attente">En attente</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Liste des absences</CardTitle>
                                    <CardDescription>
                                        {activeTab === "all"
                                            ? "Toutes vos absences pour l'année académique 2024-2025"
                                            : `Absences ${activeTab} pour l'année académique 2024-2025`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableCaption>Liste des absences pour l'année académique 2024-2025</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Cours</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Horaire</TableHead>
                                                <TableHead>Durée</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAbsences.length > 0 ? (
                                                filteredAbsences.map((absence) => (
                                                    <TableRow key={absence.id}>
                                                        <TableCell className="font-medium">{absence.courseName}</TableCell>
                                                        <TableCell>{formatDate(absence.date)}</TableCell>
                                                        <TableCell>{absence.startTime} - {absence.endTime}</TableCell>
                                                        <TableCell>{absence.duration}h</TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${absence.status === "Justifiée"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : absence.status === "Non justifiée"
                                                                        ? "bg-red-100 text-red-800"
                                                                        : "bg-amber-100 text-amber-800"
                                                                }`}>
                                                                {absence.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-2">
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
                                                        Aucune absence {activeTab !== "all" ? activeTab : ""} trouvée.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="text-sm text-gray-500">
                                        Total: {filteredAbsences.length} absence(s)
                                    </div>
                                    <Button variant="outline">
                                        Télécharger le récapitulatif
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
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
                                        <h3 className="text-sm font-medium text-gray-500">Durée</h3>
                                        <p className="mt-1 text-sm">{selectedAbsence.duration}h</p>
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
        </div>
    );
};

export default Absences; 