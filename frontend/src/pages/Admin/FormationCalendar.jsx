import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import apiService from '@/lib/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import "./Calendrier.css";

const FormationCalendar = () => {
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
        fetchEvents();
    }, []);

    useEffect(() => {
        if (showAddModal) {
            fetchUsers();
        }
    }, [showAddModal]);

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
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'événement:', error);
            setError(error.response?.data?.message || 'Erreur lors de la sauvegarde de l\'événement');
        }
    };

    const handleDateSelect = (info) => {
        setSelectedInfo(info);

        const startDate = info.startStr.split('T')[0];
        const startTime = info.startStr.split('T')[1]?.substring(0, 5) || '09:00';
        const endTime = info.endStr.split('T')[1]?.substring(0, 5) || '10:00';

        setNewEvent({
            title: '',
            date: startDate,
            startTime: startTime,
            endTime: endTime,
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

        const sizeClass = durationHours < 1 ? 'fc-timegrid-event-short' : 'fc-timegrid-event-long';

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

        const formattedDate = format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr });

        return (
            <Dialog open={showDayEventsModal} onOpenChange={setShowDayEventsModal}>
                <DialogContent className="max-w-lg day-events-dialog">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="capitalize">
                            Événements du {formattedDate}
                        </DialogTitle>
                        <button
                            onClick={() => setShowDayEventsModal(false)}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </DialogHeader>

                    <div className="event-list-container">
                        {selectedDayEvents.length === 0 ? (
                            <p className="py-4 text-center text-gray-500">Aucun événement ce jour</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedDayEvents.map((event) => {
                                    const startDate = new Date(event.start);
                                    const endDate = new Date(event.end);

                                    return (
                                        <div
                                            key={event.id}
                                            className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 event-list-item"
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
                                                <h3 className="font-medium">{event.title}</h3>
                                                <span className="text-sm text-gray-500">
                                                    {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                                                    {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {event.extendedProps.location && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    <span className="font-medium">Lieu:</span> {event.extendedProps.location}
                                                </p>
                                            )}

                                            {event.extendedProps.type && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Type:</span> {event.extendedProps.type}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDayEventsModal(false)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold text-gray-800">Emploi du temps</h1>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            onClick={() => handleViewChange('timeGridDay')}
                            className={`view-button relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'timeGridDay'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Jour
                        </button>
                        <button
                            onClick={() => handleViewChange('timeGridWeek')}
                            className={`view-button relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'timeGridWeek'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Semaine
                        </button>
                        <button
                            onClick={() => handleViewChange('dayGridMonth')}
                            className={`view-button relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${currentView === 'dayGridMonth'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Mois
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleNavigate('prev')}
                            className="p-2 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => {
                                const calendarApi = calendarRef.current.getApi();
                                calendarApi.today();
                            }}
                            className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Aujourd'hui
                        </button>

                        <button
                            onClick={() => handleNavigate('next')}
                            className="p-2 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

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
                        className="flex items-center"
                    >
                        Ajouter un événement
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center p-6">
                    <div className="w-6 h-6 border-2 border-t-2 border-gray-200 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Chargement des événements...</span>
                </div>
            ) : (
                <div className={`overflow-hidden bg-white rounded-lg shadow-md ${currentView === 'timeGridDay' ? 'day-view-container' : ''}`}>
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
                        selectable={true}
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
                            omitZeroMinute: currentView === 'timeGridDay'
                        }}
                        slotLabelInterval={currentView === 'timeGridDay' ? "01:00" : null}

                        dateClick={handleDayClick}
                        dayCellContent={dayCellContent}
                    />
                </div>
            )}

            {showAddModal && (
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editMode ? "Modifier l'événement" : "Nouvel événement"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Titre</Label>
                                    <Input
                                        id="title"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        placeholder="Titre de l'événement"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    />
                                </div>

                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <Label htmlFor="startTime">Heure de début</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={newEvent.startTime}
                                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="endTime">Heure de fin</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={newEvent.endTime}
                                            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="location">Lieu</Label>
                                    <Input
                                        id="location"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                        placeholder="Lieu de l'événement (ex: Salle A101)"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="type">Type d'événement</Label>
                                    <Input
                                        id="type"
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                        placeholder="Type d'événement (ex: Cours, TP, Réunion...)"
                                        maxLength={30}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        placeholder="Description de l'événement"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-lg font-semibold">Sélectionner les participants</h3>
                                {isLoadingUsers ? (
                                    <p>Chargement des utilisateurs...</p>
                                ) : (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {allUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center p-2 space-x-2 rounded hover:bg-gray-100"
                                            >
                                                <Checkbox
                                                    id={`user-${user.id}`}
                                                    checked={selectedParticipants.includes(user.id)}
                                                    onCheckedChange={() => handleParticipantToggle(user.id)}
                                                />
                                                <label
                                                    htmlFor={`user-${user.id}`}
                                                    className="text-sm font-medium leading-none"
                                                >
                                                    {user.firstName} {user.lastName} ({user.email})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditMode(false);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSaveEvent}
                                disabled={!newEvent.title || !newEvent.date}
                            >
                                {editMode ? "Mettre à jour" : "Ajouter"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {showDayEventsModal && <DayEventsModal />}
        </div>
    );
};

export default FormationCalendar;