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
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [currentView, setCurrentView] = useState('timeGridDay');
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [showDayEventsModal, setShowDayEventsModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState(null);
    const calendarRef = useRef(null);

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
        // Ajouter un petit délai pour s'assurer que le token et les données utilisateur sont chargés
        const timer = setTimeout(() => {
            fetchEvents();
        }, 500);
        
        // Nettoyer le timer si le composant est démonté
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (showAddModal) {
            fetchUsers();
        }
    }, [showAddModal]);

    const fetchEvents = async (retryCount = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/get-user-events', {
                timeout: 15000 // 15 seconds timeout
            });

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
            } else {
                setEvents([]);
                setError("Aucun événement trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des événements:", error);
            
            // Retry logic for network errors
            if (retryCount < 3 && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
                console.log(`Retrying events fetch attempt ${retryCount + 1}/3...`);
                setTimeout(() => fetchEvents(retryCount + 1), 1000 * (retryCount + 1));
                return;
            }
            
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

            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            };

            await apiService.post('/create-event', eventData, { headers });

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

    const handleDateSelect = (info) => {
    };

    const handleEventClick = (info) => {
        const event = info.event;
        const extendedProps = event.extendedProps;

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

        setEditMode(true);
        setShowAddModal(true);
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
                <div className={`text-right p-1 ${isToday ? 'bg-blue-100 font-bold rounded-full w-7 h-7 flex items-center justify-center ml-auto' : ''}`}>
                    {dayNumberText}
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

        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(selectedDate);
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

                                                    setEditMode(true);
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
                                        ...newEvent,
                                        date: today.toISOString().split('T')[0],
                                        startTime: '09:00',
                                        endTime: '10:00'
                                    });
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
                <div className="flex justify-center items-center h-[400px]">
                    <div className="flex flex-col items-center">
                        <motion.div
                            className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                        />
                        <p className="mt-3 text-sm font-medium text-gray-600">Chargement du calendrier...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex justify-center items-center h-[400px]">
                    <div className="flex flex-col items-center max-w-md text-center">
                        <div className="text-red-500 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Erreur de chargement</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fetchEvents()}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm"
                        >
                            Réessayer
                        </motion.button>
                    </div>
                </div>
            );
        }
        
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full"
            >
                <div className="grid grid-cols-1 gap-4">
                    <motion.div
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="overflow-hidden transition-shadow duration-300 border-0 shadow-none hover:shadow-sm">
                            <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        <CalendarIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        <CardTitle className="text-lg">Calendrier</CardTitle>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="inline-flex rounded-md shadow-sm">
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleViewChange('timeGridDay')}
                                                className={`view-button relative inline-flex items-center rounded-l-md px-3 py-1 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'timeGridDay'
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
                                                className={`view-button relative -ml-px inline-flex items-center px-3 py-1 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'timeGridWeek'
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
                                                className={`view-button relative -ml-px inline-flex items-center rounded-r-md px-3 py-1 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'dayGridMonth'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Mois
                                            </motion.button>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleNavigate('prev')}
                                                className="p-1 transition-colors rounded-full hover:bg-gray-100"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const calendarApi = calendarRef.current.getApi();
                                                    calendarApi.today();
                                                }}
                                                className="px-2 py-1 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Aujourd'hui
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleNavigate('next')}
                                                className="p-1 transition-colors rounded-full hover:bg-gray-100"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </motion.button>
                                        </div>

                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button
                                                onClick={() => {
                                                    const today = new Date();
                                                    setNewEvent({
                                                        ...newEvent,
                                                        date: today.toISOString().split('T')[0],
                                                        startTime: '09:00',
                                                        endTime: '10:00'
                                                    });
                                                    setEditMode(false);
                                                    setShowAddModal(true);
                                                }}
                                                className="flex items-center text-xs transition-all duration-200 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                                size="sm"
                                            >
                                                <Plus className="mr-1 h-3.5 w-3.5" />
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
                                        slotDuration="01:00:00"
                                        slotLabelInterval="01:00"
                                        ref={calendarRef}
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        initialView="timeGridDay"
                                        headerToolbar={false}
                                        events={events}
                                        selectable={false}
                                        select={handleDateSelect}
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
                                            omitZeroMinute: true
                                        }}
                                        dateClick={handleDayClick}
                                        dayCellContent={dayCellContent}
                                        nowIndicator={true}
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
            <div className="bg-white">
                {renderContent()}
            </div>

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
                                        {editMode ? "Modifier l'événement" : "Nouvel événement"}
                                    </DialogTitle>
                                    <DialogDescription className="mt-2 text-base">
                                        {editMode ? "Apportez les modifications nécessaires à votre événement." : "Complétez les informations pour créer un nouvel événement."}
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
                                            )}
                                        </div>
                                    </motion.div>
                                </div>

                                <DialogFooter className="flex justify-end mt-6 space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditMode(false);
                                        }}
                                        className="transition-all duration-200 border-2 rounded-full hover:bg-gray-100"
                                        disabled={isSaving}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleSaveEvent}
                                        disabled={!newEvent.title || !newEvent.date || isSaving}
                                        className="transition-all duration-200 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                    >
                                        {isSaving ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                    }}
                                                    className="w-4 h-4 mr-2"
                                                >
                                                    <svg
                                                        className="w-4 h-4 text-white animate-spin"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                </motion.div>
                                                {editMode ? "Mise à jour en cours..." : "Enregistrement en cours..."}
                                            </>
                                        ) : (
                                            <>
                                                {editMode ? "Mettre à jour" : "Enregistrer"}
                                            </>
                                        )}
                                    </Button>
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