import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChartContainer } from "../../components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

const Grades = () => {
    const [activeTab, setActiveTab] = useState("courses");
    const averages = calculateAverages();

    // Calcul de la moyenne générale
    const calculateOverallAverage = () => {
        let total = 0;
        let count = 0;

        courseGrades.forEach(grade => {
            total += (grade.value / grade.maxValue) * 20;
            count += 1;
        });

        return (total / count).toFixed(2);
    };

    return (
        <div className="container p-8 mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h1 className="mb-4 text-3xl font-bold text-gray-800">
                    Notes et résultats
                </h1>

                <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Moyenne générale</CardTitle>
                            <CardDescription>Votre performance globale</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-center text-blue-600">
                                {calculateOverallAverage()}/20
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Meilleure note</CardTitle>
                            <CardDescription>Votre note la plus élevée</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-center text-green-600">
                                {Math.max(...courseGrades.map(grade => grade.value))}/20
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes à venir</CardTitle>
                            <CardDescription>Examens prévus</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-center text-amber-600">
                                3
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition des moyennes par matière</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={Object.keys(averages).map(subject => ({
                                            subject,
                                            moyenne: parseFloat(averages[subject].average.toFixed(2))
                                        }))}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 20]} />
                                        <Tooltip formatter={(value) => [value.toFixed(2) + '/20', 'Moyenne']} />
                                        <Legend />
                                        <Bar dataKey="moyenne" name="Moyenne" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Tabs defaultValue="courses" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="courses">Notes des cours</TabsTrigger>
                            <TabsTrigger value="projects">Notes des projets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="courses">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes des cours</CardTitle>
                                    <CardDescription>
                                        Consultez vos notes pour chaque cours et examen
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableCaption>Liste de vos notes pour l'année académique 2024-2025</TableCaption>
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
                                                <TableRow key={grade.id}>
                                                    <TableCell className="font-medium">{grade.courseName}</TableCell>
                                                    <TableCell>{grade.subject}</TableCell>
                                                    <TableCell>{grade.type}</TableCell>
                                                    <TableCell>{new Date(grade.date).toLocaleDateString('fr-FR')}</TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        <span className={
                                                            grade.value >= 16 ? "text-green-600" :
                                                                grade.value >= 12 ? "text-blue-600" :
                                                                    grade.value >= 10 ? "text-amber-600" : "text-red-600"
                                                        }>
                                                            {grade.value}/{grade.maxValue}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{grade.comment}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="projects">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes des projets</CardTitle>
                                    <CardDescription>
                                        Consultez vos notes pour chaque projet
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableCaption>Liste de vos notes de projets pour l'année académique 2024-2025</TableCaption>
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
                                                <TableRow key={grade.id}>
                                                    <TableCell className="font-medium">{grade.projectName}</TableCell>
                                                    <TableCell>{grade.courseName}</TableCell>
                                                    <TableCell>{grade.type}</TableCell>
                                                    <TableCell>{new Date(grade.date).toLocaleDateString('fr-FR')}</TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        <span className={
                                                            grade.value >= 16 ? "text-green-600" :
                                                                grade.value >= 12 ? "text-blue-600" :
                                                                    grade.value >= 10 ? "text-amber-600" : "text-red-600"
                                                        }>
                                                            {grade.value}/{grade.maxValue}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{grade.comment}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="ml-auto">
                                        Télécharger le relevé de notes
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Grades; 