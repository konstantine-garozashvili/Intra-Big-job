import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import apiService from '@/lib/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, MapPin, Users, Info, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageTransition from '../../components/PageTransition';
import "./Calendar.css";

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: custom * 0.1,
            duration: 0.5,
            ease: "easeOut",
        },
    }),
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: custom * 0.05 + 0.3,
            duration: 0.3,
        },
    }),
};

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [currentView, setCurrentView] = useState('timeGridDay');
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [showDayEventsModal, setShowDayEventsModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState(null);
    const calendarRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [todayButtonText, setTodayButtonText] = useState('Aujourd\'hui');
    const [eventCreator, setEventCreator] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        type: '',
        description: '',
    });

    useEffect(() => {
        getUserProfileFromAPI();
        fetchEvents();

        switch (currentView) {
            case 'timeGridDay':
                setTodayButtonText('Aujourd\'hui');
                break;
            case 'timeGridWeek':
                setTodayButtonText('Cette semaine');
                break;
            case 'dayGridMonth':
                setTodayButtonText('Ce mois-ci');
                break;
            default:
                setTodayButtonText('Aujourd\'hui');
        }
    }, []);


    useEffect(() => {
        if (showAddModal) {
            fetchUsers();
        }
    }, [showAddModal]);

    const getUserProfileFromAPI = async () => {
        try {
            const response = await apiService.get('/profile');

            if (response && response.success && response.data) {
                setCurrentUser({
                    id: response.data.id,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email
                });
            } else {
                console.log("Pas de données utilisateur dans la réponse");
            }
        } catch (error) {
            console.error("Erreur récupération profil utilisateur:", error);
        }
    };


    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/get-user-events');

            if (response) {
                const formattedEvents = response.map(event => ({
                    id: event.id.toString(),
                    title: event.title,
                    start: `${event.startDateTime}`,
                    end: `${event.endDateTime}`,
                    extendedProps: {
                        location: event.location || '',
                        type: event.type || '',
                        description: event.description || '',
                        createdBy: event.createdBy,
                        participants: event.participants || []
                    }
                }));

                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des événements:", error);
            setError("Impossible de charger les événements. Veuillez réessayer plus tard.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        setError(null);

        try {
            const userData = await apiService.get('/users');

            if (userData && userData.success) {
                setAllUsers(userData.data);
            } else {
                setError('Format de réponse incorrect');
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Erreur inconnue');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleParticipantToggle = (userId) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };


    const handleSaveEvent = async () => {
        try {
            setIsSaving(true);

            const eventData = {
                title: newEvent.title,
                description: newEvent.description,
                date: newEvent.date,
                startTime: newEvent.startTime,
                endTime: newEvent.endTime,
                location: newEvent.location,
                type: newEvent.type,
                participants: selectedParticipants
            };

            let response;

            if (newEvent.id && editMode) {
                response = await apiService.put(`/update-event/${newEvent.id}`, eventData, apiService.withAuth());
                console.log("Événement mis à jour:", response);
            } else {
                response = await apiService.post('/create-event', eventData, apiService.withAuth());
                console.log("Nouvel événement créé:", response);
            }

            await fetchEvents();

            setShowAddModal(false);
            setEditMode(false);
            setIsSaving(false);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'événement:', error);
            setError(error.response?.data?.message || 'Erreur lors de la sauvegarde de l\'événement');
            setIsSaving(false);
        }
    };

    const openNewEventModal = () => {

        const today = new Date();

        setNewEvent({
            title: '',
            date: today.toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            location: '',
            type: '',
            description: '',
        });

        setSelectedParticipants([]);

        setEditMode(false);
        setShowAddModal(true);
    };


    const handleEventClick = (info) => {
        const event = info.event;
        const extendedProps = event.extendedProps;

        const eventCreatorId = typeof event.extendedProps.createdBy === 'object'
            ? String(event.extendedProps.createdBy.id)
            : String(event.extendedProps.createdBy);

        const creatorId = typeof extendedProps.createdBy === 'object'
            ? String(extendedProps.createdBy.id)
            : String(extendedProps.createdBy);

        const currentUserId = String(currentUser?.id);
        const isCreator = currentUserId === creatorId;

        console.log("Event creator ID:", creatorId);
        console.log("Current user ID:", currentUserId);
        console.log("Is creator?", isCreator);

        const startDate = event.start.toISOString().split('T')[0];
        const startTime = event.start.toTimeString().substring(0, 5);
        const endTime = event.end ? event.end.toTimeString().substring(0, 5) : '';

        setNewEvent({
            id: event.id,
            title: event.title,
            date: startDate,
            startTime: startTime,
            endTime: endTime,
            location: extendedProps.location || '',
            type: extendedProps.type || '',
            description: extendedProps.description || '',
        });

        if (extendedProps.participants && Array.isArray(extendedProps.participants)) {
            setSelectedParticipants(extendedProps.participants.map(p => typeof p === 'object' ? p.id : p));
        } else {
            setSelectedParticipants([]);
        }

        setEditMode(isCreator);
        setShowAddModal(true);
        setEventCreator(eventCreatorId);
    };


    const renderEventContent = (eventInfo) => {
        const { event } = eventInfo;
        const extendedProps = event.extendedProps;

        const start = new Date(event.start);
        const end = new Date(event.end || start);
        const durationMs = end - start;
        const durationHours = durationMs / (1000 * 60 * 60);

        const sizeClass = durationHours < 1 ? 'fc-timegrid-event-short duration-very-short' : 'fc-timegrid-event-long';

        return (
            <div className={`event-content-wrapper ${sizeClass}`}>
                <div className="font-medium fc-event-title">{event.title}</div>
                {extendedProps.location && (
                    <div className="mt-1 text-xs event-location">{extendedProps.location}</div>
                )}
                <div className="text-xs event-time">
                    {event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                    {event.end ? event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
            </div>
        );
    };

    const handleNavigate = (direction) => {
        const calendarApi = calendarRef.current.getApi();
        direction === 'prev' ? calendarApi.prev() : calendarApi.next();
    };

    const handleViewChange = (viewName) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(viewName);
        setCurrentView(viewName);

        switch (viewName) {
            case 'timeGridDay':
                setTodayButtonText('Aujourd\'hui');
                break;
            case 'timeGridWeek':
                setTodayButtonText('Cette semaine');
                break;
            case 'dayGridMonth':
                setTodayButtonText('Ce mois-ci');
                break;
            default:
                setTodayButtonText('Aujourd\'hui');
        }
    };

    const countEventsForDay = (date) => {
        if (!events || events.length === 0) return 0;

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return events.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart >= dayStart && eventStart <= dayEnd;
        }).length;
    };

    const handleDayClick = (info) => {
        if (info.view.type === 'dayGridMonth') {
            const dayStart = new Date(info.date);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(info.date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayEvents = events.filter(event => {
                const eventStart = new Date(event.start);
                return eventStart >= dayStart && eventStart <= dayEnd;
            });

            setSelectedDayEvents(dayEvents);
            setSelectedDate(info.date);
            setShowDayEventsModal(true);
        }
    };


    const dayCellContent = (args) => {
        const { date, dayNumberText, view } = args;

        if (view.type !== 'dayGridMonth') {
            return { html: dayNumberText };
        }

        const isToday = new Date().toDateString() === date.toDateString();

        const eventCount = countEventsForDay(date);

        return (
            <div className="flex flex-col h-full">
                <div className="w-full p-1 text-left">
                    <span className={`${isToday ? 'bg-blue-100 font-bold rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                        {dayNumberText}
                    </span>
                </div>
                <div className="flex items-center justify-center flex-grow">
                    {eventCount > 0 && (
                        <div className="event-count-indicator">
                            {eventCount} {eventCount === 1 ? 'événement' : 'événements'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const DayEventsModal = () => {
        if (!selectedDate) return null;

        const formattedDate = format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr });
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        return (
            <Dialog open={showDayEventsModal} onOpenChange={setShowDayEventsModal}>
                <DialogContent className="max-w-lg border-0 shadow-xl day-events-dialog">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <DialogHeader className="flex flex-row items-center justify-between">
                            <DialogTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                {capitalizedDate}
                            </DialogTitle>
                            <button
                                onClick={() => setShowDayEventsModal(false)}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </DialogHeader>

                        <div className="mt-4 event-list-container">
                            {selectedDayEvents.length === 0 ? (
                                <div className="py-8 text-center">
                                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-400" />
                                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                                        Aucun événement ce jour
                                    </p>
                                    <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                                        Cliquez sur "Ajouter un événement" pour planifier une activité
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-2 space-y-3">
                                    {selectedDayEvents.map((event, index) => {
                                        const startDate = new Date(event.start);
                                        const endDate = new Date(event.end);

                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                                className="p-3 bg-white border rounded-md cursor-pointer hover:bg-gray-50 event-list-item"
                                                onClick={() => {
                                                    const eventObj = {
                                                        id: event.id,
                                                        title: event.title,
                                                        date: startDate.toISOString().split('T')[0],
                                                        startTime: startDate.toTimeString().substring(0, 5),
                                                        endTime: endDate.toTimeString().substring(0, 5),
                                                        location: event.extendedProps.location || '',
                                                        type: event.extendedProps.type || '',
                                                        description: event.extendedProps.description || '',
                                                    };

                                                    setNewEvent(eventObj);

                                                    if (event.extendedProps.participants && Array.isArray(event.extendedProps.participants)) {
                                                        setSelectedParticipants(event.extendedProps.participants.map(p =>
                                                            typeof p === 'object' ? p.id : p
                                                        ));
                                                    } else {
                                                        setSelectedParticipants([]);
                                                    }

                                                    const creatorId = event.extendedProps.createdBy?.id || event.extendedProps.createdBy;
                                                    const isCreator = currentUser && currentUser.id === creatorId;
                                                    setEditMode(isCreator);
                                                    setShowDayEventsModal(false);
                                                    setShowAddModal(true);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <h3 className="font-medium text-gray-800">{event.title}</h3>
                                                    <span className="text-sm font-medium text-gray-500">
                                                        {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                                                        {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                {event.extendedProps.location && (
                                                    <div className="flex items-center mt-2 text-sm text-gray-600">
                                                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                        {event.extendedProps.location}
                                                    </div>
                                                )}

                                                {event.extendedProps.type && (
                                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                                        <Info className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                        {event.extendedProps.type}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowDayEventsModal(false)}
                                className="transition-all duration-200 border-2 rounded-full hover:bg-gray-100"
                            >
                                Fermer
                            </Button>
                            <Button
                                onClick={() => {
                                    const today = selectedDate;
                                    setNewEvent({
                                        title: '',
                                        date: today.toISOString().split('T')[0],
                                        startTime: '09:00',
                                        endTime: '10:00',
                                        location: '',
                                        type: '',
                                        description: '',
                                    });
                                    setSelectedParticipants([]);
                                    setEditMode(false);
                                    setShowDayEventsModal(false);
                                    setShowAddModal(true);
                                }}
                                className="transition-all duration-200 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Nouvel événement
                            </Button>
                        </DialogFooter>
                    </motion.div>
                </DialogContent>
            </Dialog>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="container p-6 mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Emploi du temps
                        </h1>
                    </div>

                    <Card className="overflow-hidden border-0 shadow-lg min-h-[550px]">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                    <CalendarIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                                    <CardTitle className="text-xl">Calendrier</CardTitle>
                                </div>
                                <div className="animate-pulse">
                                    <div className="w-48 h-8 bg-gray-200 rounded-md"></div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto border-4 rounded-full border-t-blue-600 border-b-blue-300 border-l-blue-300 border-r-blue-300 animate-spin"></div>
                                <p className="mt-4 font-medium text-gray-600">Chargement des événements...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        if (error) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="container p-6 mx-auto"
                >
                    <div
                        className="px-6 py-4 text-red-700 bg-red-100 border border-red-400 rounded-lg shadow-md"
                        role="alert"
                    >
                        <div className="flex items-center">
                            <svg
                                className="w-6 h-6 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                ></path>
                            </svg>
                            <strong className="text-lg font-bold">Erreur!</strong>
                        </div>
                        <p className="mt-2">{error}</p>
                        <div className="mt-4">
                            <Button
                                onClick={() => fetchEvents()}
                                className="text-white bg-red-600 hover:bg-red-700"
                            >
                                Réessayer
                            </Button>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="container p-6 mx-auto"
            >
                <motion.div
                    className="flex items-center justify-between mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                </motion.div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                    <motion.div
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="overflow-hidden transition-shadow duration-300 border-0 shadow-lg hover:shadow-xl">
                            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        <CalendarIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                                        <CardTitle className="text-xl">Calendrier</CardTitle>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="inline-flex rounded-md shadow-sm">
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleViewChange('timeGridDay')}
                                                className={`view-button relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'timeGridDay'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Jour
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleViewChange('timeGridWeek')}
                                                className={`view-button relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'timeGridWeek'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Semaine
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleViewChange('dayGridMonth')}
                                                className={`view-button relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'dayGridMonth'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Mois
                                            </motion.button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleNavigate('prev')}
                                                className="p-2 transition-colors rounded-full hover:bg-gray-100"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const calendarApi = calendarRef.current.getApi();
                                                    calendarApi.today();
                                                }}
                                                className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                {todayButtonText}
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleNavigate('next')}
                                                className="p-2 transition-colors rounded-full hover:bg-gray-100"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </motion.button>
                                        </div>

                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button
                                                onClick={openNewEventModal}
                                                className="flex items-center transition-all duration-200 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                            >
                                                <Plus className="mr-1.5 h-4 w-4" />
                                                Ajouter un événement
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className={`overflow-hidden bg-white ${currentView === 'timeGridDay' ? 'day-view-container' : ''}`}>
                                    <FullCalendar
                                        allDaySlot={false}
                                        slotMinTime="07:00:00"
                                        slotMaxTime="20:00:00"
                                        slotDuration="00:30:00"
                                        ref={calendarRef}
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        initialView="timeGridDay"
                                        headerToolbar={false}
                                        events={events}
                                        selectable={false}
                                        eventClick={handleEventClick}
                                        editable={true}
                                        dayMaxEvents={true}
                                        height="auto"
                                        locale={frLocale}
                                        eventContent={renderEventContent}
                                        slotLabelFormat={{
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                            omitZeroMinute: currentView === 'timeGridDay'
                                        }}
                                        slotLabelInterval={currentView === 'timeGridDay' ? "01:00" : null}
                                        dateClick={handleDayClick}
                                        dayCellContent={dayCellContent}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        );
    };

    return (
        <>
            <PageTransition>
                <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
                    {renderContent()}
                </div>
            </PageTransition>

            <AnimatePresence>
                {showAddModal && (
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogContent className="max-w-4xl overflow-hidden border-0 shadow-xl rounded-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-y-auto max-h-[80vh]"
                            >
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                        {editMode ? "Modifier l'événement" : newEvent.id ? "Détails de l'événement" : "Nouvel événement"}
                                    </DialogTitle>
                                    <DialogDescription className="mt-2 text-base">
                                        {editMode
                                            ? "Apportez les modifications nécessaires à votre événement."
                                            : newEvent.id
                                                ? "Consultez les détails de cet événement."
                                                : "Complétez les informations pour créer un nouvel événement."}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
                                    <motion.div
                                        custom={0}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-4"
                                    >
                                        <div>
                                            <Label htmlFor="title" className="font-medium">Titre</Label>
                                            <Input
                                                id="title"
                                                value={newEvent.title}
                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                placeholder="Titre de l'événement"
                                                className="mt-1.5"
                                                disabled={newEvent.id && !editMode}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="date" className="font-medium">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={newEvent.date}
                                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                                className="mt-1.5"
                                                disabled={newEvent.id && !editMode}
                                            />
                                        </div>

                                        <div className="flex space-x-4">
                                            <div className="flex-1">
                                                <Label htmlFor="startTime" className="font-medium">Heure de début</Label>
                                                <div className="flex items-center mt-1.5">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                                    <Input
                                                        id="startTime"
                                                        type="time"
                                                        value={newEvent.startTime}
                                                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                                        disabled={newEvent.id && !editMode}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor="endTime" className="font-medium">Heure de fin</Label>
                                                <div className="flex items-center mt-1.5">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                                    <Input
                                                        id="endTime"
                                                        type="time"
                                                        value={newEvent.endTime}
                                                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                                        disabled={newEvent.id && !editMode}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <motion.div
                                            custom={1}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <Label htmlFor="location" className="font-medium">Lieu</Label>
                                            <div className="flex items-center mt-1.5">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                <Input
                                                    id="location"
                                                    value={newEvent.location}
                                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                                    placeholder="Lieu de l'événement (ex: Salle A101)"
                                                    disabled={newEvent.id && !editMode}
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            custom={2}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <Label htmlFor="type" className="font-medium">Type d'événement</Label>
                                            <Input
                                                id="type"
                                                value={newEvent.type}
                                                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                                placeholder="Type d'événement (ex: Cours, TP, Réunion...)"
                                                maxLength={30}
                                                className="mt-1.5"
                                                disabled={newEvent.id && !editMode}
                                            />
                                        </motion.div>

                                        <motion.div
                                            custom={3}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <Label htmlFor="description" className="font-medium">Description</Label>
                                            <div className="flex items-center mt-1.5">
                                                <Info className="self-start w-4 h-4 mt-2 mr-2 text-gray-500" />
                                                <Input
                                                    id="description"
                                                    value={newEvent.description}
                                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                    placeholder="Description de l'événement"
                                                    disabled={newEvent.id && !editMode}
                                                />
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        custom={1}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center">
                                                    <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                    <h3 className="text-lg font-semibold">Participants</h3>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <span className="px-2 py-1 text-blue-800 bg-blue-100 rounded-full">
                                                        {selectedParticipants.length} sélectionné(s)
                                                    </span>
                                                </div>
                                            </div>

                                            {isLoadingUsers ? (
                                                <div className="flex items-center justify-center h-32">
                                                    <div className="w-6 h-6 border-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                                    <span className="ml-2 text-gray-600">Chargement des utilisateurs...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {(editMode || !newEvent.id) ? (
                                                        <>
                                                            <div className="relative mb-3">
                                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                                                    </svg>
                                                                </div>
                                                                <Input
                                                                    type="search"
                                                                    id="user-search"
                                                                    className="pl-10 bg-white"
                                                                    placeholder="Rechercher par nom..."
                                                                    onChange={(e) => {
                                                                        const searchTerm = e.target.value.toLowerCase();
                                                                        const filteredUsers = allUsers.filter(user =>
                                                                            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm) ||
                                                                            user.email.toLowerCase().includes(searchTerm)
                                                                        );
                                                                        if (searchTerm) {
                                                                            setFilteredUsers(filteredUsers);
                                                                        } else {
                                                                            setFilteredUsers(null);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="space-y-2 max-h-[330px] overflow-y-auto bg-white rounded-md p-3 shadow-inner">
                                                                {(filteredUsers || allUsers).length > 0 ? (
                                                                    (filteredUsers || allUsers).map((user, index) => (
                                                                        <motion.div
                                                                            key={user.id}
                                                                            custom={index}
                                                                            variants={itemVariants}
                                                                            initial="hidden"
                                                                            animate="visible"
                                                                            className="flex items-center p-2 space-x-2 transition-colors rounded hover:bg-gray-100"
                                                                        >
                                                                            <Checkbox
                                                                                id={`user-${user.id}`}
                                                                                checked={selectedParticipants.includes(user.id)}
                                                                                onCheckedChange={() => handleParticipantToggle(user.id)}
                                                                                className="text-blue-600 focus:ring-blue-500"
                                                                            />
                                                                            <label
                                                                                htmlFor={`user-${user.id}`}
                                                                                className="text-sm font-medium leading-none cursor-pointer"
                                                                            >
                                                                                {user.firstName} {user.lastName}
                                                                                <span className="ml-1 text-xs text-gray-500">({user.email})</span>
                                                                            </label>
                                                                        </motion.div>
                                                                    ))
                                                                ) : (
                                                                    <div className="py-4 text-center text-gray-500">
                                                                        Aucun utilisateur trouvé
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        // Mode consultation avec distinction créateur/participants
                                                        <div className="space-y-2 max-h-[330px] overflow-y-auto bg-white rounded-md p-3 shadow-inner">
                                                            {selectedParticipants.length > 0 ? (
                                                                <>
                                                                    {/* Afficher le créateur */}
                                                                    {allUsers
                                                                        .filter(user => String(user.id) === String(eventCreator))
                                                                        .map((user, index) => (
                                                                            <motion.div
                                                                                key={user.id}
                                                                                custom={0}
                                                                                variants={itemVariants}
                                                                                initial="hidden"
                                                                                animate="visible"
                                                                                className="flex items-center p-2 space-x-2 transition-colors border border-blue-100 rounded bg-blue-50"
                                                                            >
                                                                                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white bg-blue-600 rounded-full">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </div>
                                                                                <div className="flex-grow text-sm font-medium">
                                                                                    {user.firstName} {user.lastName}
                                                                                    <span className="ml-1 text-xs text-gray-500">({user.email})</span>
                                                                                </div>
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                                    Créateur
                                                                                </span>
                                                                            </motion.div>
                                                                        ))
                                                                    }

                                                                    {/* Afficher les autres participants */}
                                                                    {allUsers
                                                                        .filter(user =>
                                                                            selectedParticipants.includes(user.id) &&
                                                                            String(user.id) !== String(eventCreator)
                                                                        )
                                                                        .map((user, index) => (
                                                                            <motion.div
                                                                                key={user.id}
                                                                                custom={index + 1}
                                                                                variants={itemVariants}
                                                                                initial="hidden"
                                                                                animate="visible"
                                                                                className="flex items-center p-2 space-x-2 transition-colors rounded hover:bg-gray-50"
                                                                            >
                                                                                <div className="flex-shrink-0 w-2 h-2 mt-1 bg-green-500 rounded-full"></div>
                                                                                <div className="flex-grow text-sm font-medium">
                                                                                    {user.firstName} {user.lastName}
                                                                                    <span className="ml-1 text-xs text-gray-500">({user.email})</span>
                                                                                </div>
                                                                                {String(user.id) === String(currentUser?.id) && (
                                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                                        Vous
                                                                                    </span>
                                                                                )}
                                                                            </motion.div>
                                                                        ))
                                                                    }

                                                                    {/* Si le créateur n'est pas identifiable dans la liste */}
                                                                    {!allUsers.some(user => String(user.id) === String(eventCreator)) && (
                                                                        <motion.div
                                                                            custom={0}
                                                                            variants={itemVariants}
                                                                            initial="hidden"
                                                                            animate="visible"
                                                                            className="flex items-center p-2 space-x-2 transition-colors border border-blue-100 rounded bg-blue-50"
                                                                        >
                                                                            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white bg-blue-600 rounded-full">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-grow text-sm font-medium">
                                                                                Créateur de l'événement
                                                                            </div>
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                                Créateur
                                                                            </span>
                                                                        </motion.div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="py-4 text-center text-gray-500">
                                                                    Aucun participant à cet événement
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditMode(false);
                                        }}
                                        className="transition-all duration-200 border-2 rounded-full hover:bg-gray-100"
                                        disabled={isSaving}
                                    >
                                        Fermer
                                    </Button>

                                    {(editMode || !newEvent.id) && (
                                        <Button
                                            onClick={handleSaveEvent}
                                            disabled={!newEvent.title || !newEvent.date || isSaving}
                                            className="transition-all duration-200 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                        >
                                            {isSaving ? "Sauvegarde en cours..." : (editMode ? "Mettre à jour" : "Créer l'événement")}
                                        </Button>
                                    )}
                                </DialogFooter>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            {showDayEventsModal && <DayEventsModal />}
        </>
    );
};

export default Calendar;