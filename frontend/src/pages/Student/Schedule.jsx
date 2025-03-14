import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Schedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Données mockées des cours
    const courses = [
        {
            id: 1,
            name: 'Développement Web',
            professor: 'M. Martin',
            room: 'Salle A101',
            startTime: '09:00',
            endTime: '10:30',
            day: 1, // Lundi
            type: 'CM',
            color: 'bg-blue-100 border-blue-300'
        },
        {
            id: 2,
            name: 'Base de données',
            professor: 'Mme Bernard',
            room: 'Salle B202',
            startTime: '11:00',
            endTime: '12:30',
            day: 1, // Lundi
            type: 'TD',
            color: 'bg-green-100 border-green-300'
        },
        {
            id: 3,
            name: 'Cybersécurité',
            professor: 'M. Dubois',
            room: 'Salle C303',
            startTime: '14:00',
            endTime: '17:00',
            day: 2, // Mardi
            type: 'TP',
            color: 'bg-purple-100 border-purple-300'
        },
        // Ajoutez d'autres cours selon vos besoins
    ];

    // Générer les heures de la journée
    const hours = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

    // Générer les jours de la semaine
    const weekDays = Array.from({ length: 5 }, (_, i) => {
        const date = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i);
        return {
            date,
            name: format(date, 'EEEE', { locale: fr }),
            shortName: format(date, 'EEE', { locale: fr }),
            fullDate: format(date, 'd MMMM', { locale: fr })
        };
    });

    // Fonction pour obtenir les cours d'un jour spécifique
    const getCoursesForDay = (day) => {
        return courses.filter(course => course.day === day);
    };

    // Fonction pour calculer la position et la hauteur d'un cours
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

    const previousWeek = () => {
        setCurrentDate(prev => addDays(prev, -7));
    };

    const nextWeek = () => {
        setCurrentDate(prev => addDays(prev, 7));
    };

    return (
        <div className="container p-8 mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* En-tête avec navigation */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Emploi du temps</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={previousWeek}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-gray-600 font-medium">
                            Semaine du {format(weekDays[0].date, 'd MMMM', { locale: fr })}
                        </span>
                        <button
                            onClick={nextWeek}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Grille de l'emploi du temps */}
                <div className="relative overflow-x-auto">
                    <div className="grid grid-cols-6 gap-[1px] bg-gray-200 rounded-lg">
                        {/* Colonne des heures */}
                        <div className="bg-white p-2">
                            <div className="h-20 flex items-end justify-center">
                                <span className="text-gray-400 text-sm">Heures</span>
                            </div>
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className="h-[60px] flex items-center justify-center text-sm text-gray-500"
                                >
                                    {hour}
                                </div>
                            ))}
                        </div>

                        {/* Colonnes des jours */}
                        {weekDays.map((day, index) => (
                            <div key={day.name} className="relative bg-white">
                                <div className="h-20 p-2 text-center">
                                    <p className="font-medium text-gray-800 capitalize">{day.name}</p>
                                    <p className="text-sm text-gray-500">{day.fullDate}</p>
                                </div>
                                <div className="relative h-[660px]">
                                    {/* Lignes des heures */}
                                    {hours.map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full h-[60px]"
                                            style={{ top: `${i * 60}px` }}
                                        >
                                            <div className="border-t border-gray-100 w-full h-full"></div>
                                        </div>
                                    ))}

                                    {/* Cours du jour */}
                                    {getCoursesForDay(index + 1).map((course) => (
                                        <div
                                            key={course.id}
                                            className={`absolute w-[95%] left-[2.5%] p-2 rounded-lg border ${course.color} shadow-sm`}
                                            style={getCourseStyle(course.startTime, course.endTime)}
                                        >
                                            <p className="font-medium text-sm">{course.name}</p>
                                            <p className="text-xs text-gray-600">{course.professor}</p>
                                            <p className="text-xs text-gray-600">{course.room}</p>
                                            <p className="text-xs text-gray-600">
                                                {course.startTime} - {course.endTime}
                                            </p>
                                            <span className="absolute top-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded bg-white/50">
                                                {course.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Légende */}
                <div className="mt-6 flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                        <span className="text-sm text-gray-600">CM - Cours Magistral</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                        <span className="text-sm text-gray-600">TD - Travaux Dirigés</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300"></div>
                        <span className="text-sm text-gray-600">TP - Travaux Pratiques</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule; 