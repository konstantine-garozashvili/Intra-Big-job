import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Users, Calendar, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import apiService from '@/lib/services/apiService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/services/authService';
import { Progress } from '@/components/ui/progress';

export default function FormationDetails() {
  const { id } = useParams();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showKickDialog, setShowKickDialog] = useState(false);
  const [kickStudentId, setKickStudentId] = useState(null);
  const kickStudentResolveRef = useRef(null);
  const navigate = useNavigate();

  // Move fetchFormation outside useEffect so it can be reused
  const fetchFormation = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/api/formations/${id}`);
      let f = null;
      if (res && res.success && res.data && res.data.formation) {
        f = res.data.formation;
      } else if (res && res.success && res.data && res.data.data && res.data.data.formation) {
        f = res.data.data.formation;
      } else if (res && res.formation) {
        f = res.formation;
      } else if (res && res.data) {
        f = res.data;
      }
      setFormation(f);
      setStudentCount(Array.isArray(f?.students) ? f.students.length : 0);
      setEnrolledStudents(Array.isArray(f?.students) ? f.students : []);
    } catch (err) {
      setFormation(null);
      setEnrolledStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Move fetchAcceptedStudents outside useEffect so it can be reused
  const fetchAcceptedStudents = async () => {
    try {
      const res = await apiService.get(`/api/formations/${id}/enrollment-requests?status=accepted`);
      let students = [];
      if (res && res.success && Array.isArray(res.data)) {
        students = res.data.map(r => r.user);
      } else if (Array.isArray(res)) {
        students = res.map(r => r.user);
      }
      setAcceptedStudents(students);
      setAcceptedCount(students.length);
    } catch (err) {
      setAcceptedStudents([]);
      setAcceptedCount(0);
    }
  };

  useEffect(() => {
    fetchFormation();
  }, [id]);

  useEffect(() => {
    fetchAcceptedStudents();
  }, [id]);

  // Custom confirm dialog for kicking a student
  const confirmKickStudent = (studentId) => {
    setKickStudentId(studentId);
    setShowKickDialog(true);
    return new Promise((resolve) => {
      kickStudentResolveRef.current = resolve;
    });
  };

  const handleKickStudent = async (studentId) => {
    const confirmed = await confirmKickStudent(studentId);
    if (!confirmed) return;
    try {
      await apiService.delete(`/api/formations/${id}/students/${studentId}`);
      toast.success('Étudiant retiré de la formation.');
      setEnrolledStudents((prev) => prev.filter((s) => s.id !== studentId));
      setStudentCount((prev) => Math.max(0, prev - 1));
      setAcceptedStudents((prev) => prev.filter((s) => s.id !== studentId));
      setAcceptedCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Erreur lors du retrait de l\'étudiant.');
    }
  };

  const handleKickDialogClose = (confirmed) => {
    setShowKickDialog(false);
    if (kickStudentResolveRef.current) {
      kickStudentResolveRef.current(confirmed);
      kickStudentResolveRef.current = null;
    }
    setKickStudentId(null);
  };

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    setLoadingAvailable(true);
    try {
      const res = await apiService.get(`/api/formations/${id}/available-students`);
      let users = [];
      if (res && res.success && Array.isArray(res.data)) {
        users = res.data;
      } else if (res && res.success && Array.isArray(res.data?.users)) {
        users = res.data.users;
      } else if (Array.isArray(res)) {
        users = res;
      }
      // Filter out users already enrolled
      const enrolledIds = new Set(enrolledStudents.map(s => s.id));
      users = users.filter(u => !enrolledIds.has(u.id));
      setAvailableUsers(users);
    } catch (err) {
      setAvailableUsers([]);
      toast.error("Erreur lors du chargement des utilisateurs disponibles.");
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) {
      // No search: show only the first 5 users
      return availableUsers.slice(0, 5);
    }
    const term = debouncedSearch.toLowerCase();
    return availableUsers.filter(user =>
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  }, [availableUsers, debouncedSearch]);

  const handleAddUser = async (userId) => {
    setAddingUserId(userId);
    try {
      console.log('[handleAddUser] Adding user to formation:', { formationId: id, userId });
      const res = await apiService.post(`/api/formations/${id}/students/${userId}`);
      console.log('[handleAddUser] Response from add student:', res);
      if (!res.success) {
        console.error('[handleAddUser] Add student failed:', res);
        throw new Error(res.message || "Erreur lors de l'ajout de l'utilisateur.");
      }
      toast.success('Utilisateur ajouté à la formation.');
      setShowAddModal(false);
      // Dynamically update enrolled students and counts
      const addedUser = availableUsers.find(u => u.id === userId);
      if (addedUser) {
        setEnrolledStudents((prev) => [...prev, addedUser]);
        setStudentCount((prev) => prev + 1);
        setAcceptedStudents((prev) => [...prev, addedUser]);
        setAcceptedCount((prev) => prev + 1);
        setAvailableUsers((prev) => prev.filter(u => u.id !== userId));
      }
      // If the added user is the current user, refresh user info and redirect
      const currentUser = authService.getUser();
      if (currentUser && String(currentUser.id) === String(userId)) {
        const updatedUser = await authService.getCurrentUser(true);
        if (authService.hasRole('STUDENT')) {
          navigate('/student/dashboard');
        }
      }
    } catch (error) {
      console.error('[handleAddUser] Error:', error);
      toast.error(error.message || "Erreur lors de l'ajout de l'utilisateur.");
    } finally {
      setAddingUserId(null);
    }
  };

  const getCapacityStatus = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 100) return { text: 'Complet', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/20' };
    if (percentage >= 80) return { text: 'Presque complet', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
    if (percentage >= 50) return { text: 'Places limitées', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { text: 'Places disponibles', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' };
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      ) : !formation ? (
        <div className="text-center text-gray-500">Formation non trouvée.</div>
      ) : (
        <Card className="relative rounded-3xl shadow-xl bg-white border border-gray-200 overflow-visible">
          <CardContent className="p-0">
            <div className="flex flex-col items-center gap-4 pt-12 pb-8 px-8">
              <div className="-mt-20 mb-2 z-10">
                <div className="w-32 h-32 rounded-full shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={formation.image_url || '/placeholder.svg'}
                    alt={formation.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="font-extrabold text-3xl mb-1 text-gray-900 dark:text-white text-center drop-shadow tracking-tight animate-fade-in">{formation.name}</div>
              <div className="flex flex-wrap gap-2 mb-2 animate-fade-in">
                <Badge className="bg-[#2563eb] text-white font-semibold shadow-sm animate-bounceIn">{formation.specialization?.name || 'Formation'}</Badge>
                <Badge variant="outline" className="border-[#2563eb] text-[#2563eb] bg-white font-semibold animate-bounceIn delay-100">{formation.promotion || 'N/A'}</Badge>
              </div>
              <div className="text-gray-700 dark:text-gray-100 mb-2 text-center max-w-xl animate-fade-in-slow">{formation.description}</div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-2 w-full max-w-md animate-fade-in-slow place-items-center mx-auto">
                <div className="flex items-center gap-1 text-center justify-center"><Calendar className="w-4 h-4 text-[#2563eb] dark:text-blue-400" /><span className="font-semibold text-[#2563eb] dark:text-blue-400">{formation.dateStart ? new Date(formation.dateStart).toLocaleDateString() : 'N/A'}</span></div>
                <div className="flex items-center gap-1 text-center justify-center"><Clock className="w-4 h-4 text-[#2563eb] dark:text-blue-400" /><span className="font-semibold text-[#2563eb] dark:text-blue-400">{formation.duration ? `${formation.duration} mois` : 'N/A'}</span></div>
                <div className="flex flex-col items-center gap-1 text-center justify-center col-span-2">
                  {(() => {
                    const enrolledCount = Array.isArray(formation.students) ? formation.students.length : 0;
                    const capacity = formation.capacity || 0;
                    const capacityStatus = getCapacityStatus(enrolledCount, capacity);
                    const progressPercentage = capacity > 0 ? Math.min((enrolledCount / capacity) * 100, 100) : 0;
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-[#2563eb] dark:text-blue-400" />
                          <span className="font-semibold text-[#2563eb] dark:text-blue-400">{enrolledCount} / {capacity} étudiants</span>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${capacityStatus.bgColor} ${capacityStatus.color}`}>{capacityStatus.text}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2 w-40" />
                      </>
                    );
                  })()}
                </div>
                {formation.location && <div className="flex items-center gap-1 text-center justify-center"><MapPin className="w-4 h-4 text-[#2563eb] dark:text-blue-400" /><span className="font-semibold text-[#2563eb] dark:text-blue-400">{formation.location}</span></div>}
              </div>
              <div className="flex gap-6 mt-4 animate-fade-in-slow">
                <div className="flex items-center gap-2 text-[#60a5fa] font-semibold">
                  <Users className="w-5 h-5" />
                  <span>{studentCount} étudiants inscrits</span>
                </div>
              </div>
              <div className="w-full mt-10 animate-fade-in-slow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-[#60a5fa]">Étudiants inscrits</h3>
                  <Button onClick={handleOpenAddModal} className="bg-[#2563eb] text-white font-semibold px-6 py-2 rounded-full shadow-sm hover:bg-blue-800 transition-all border-0">Ajouter</Button>
                </div>
                {enrolledStudents.length === 0 ? (
                  <div className="text-gray-500 text-sm">Aucun étudiant inscrit pour cette formation.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {enrolledStudents.map((student) => {
                      const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
                      return (
                        <li key={`${student.id}-${student.email}`} className="py-3 flex items-center gap-4 group hover:bg-gray-100 rounded-xl transition">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[#2563eb] text-lg border-2 border-gray-300 overflow-hidden">
                            {student.profilePictureUrl ? (
                              <img src={student.profilePictureUrl} alt={student.firstName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#60a5fa] truncate">{student.firstName} {student.lastName}</div>
                            <div className="text-[#60a5fa] text-xs truncate">{student.email}</div>
                          </div>
                          <button
                            className="mr-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition text-sm font-semibold opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                            onClick={() => handleKickStudent(student.id)}
                          >
                            Retirer
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="rounded-2xl shadow-2xl border border-gray-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-800 font-bold">Ajouter un utilisateur à la formation</DialogTitle>
            <DialogDescription className="text-gray-600">Choisissez un invité ou étudiant à ajouter à cette formation.</DialogDescription>
          </DialogHeader>
          {loadingAvailable ? (
            <div className="py-6 text-center"><Loader2 className="animate-spin w-6 h-6 mx-auto text-[#2563eb]" /></div>
          ) : availableUsers.length === 0 ? (
            <div className="py-6 text-center text-gray-500">Aucun utilisateur disponible à ajouter.</div>
          ) : (
            <>
              <div className="relative mb-3">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] text-gray-900 bg-white pr-10"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-2-2" /></svg>
                </span>
              </div>
              <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <li className="py-2 text-center text-gray-400">Aucun résultat.</li>
                ) : (
                  filteredUsers.map(user => {
                    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
                    return (
                      <li key={user.id} className="py-2 flex items-center gap-4 group hover:bg-gray-100 rounded-xl transition">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[#2563eb] text-base border-2 border-gray-300 overflow-hidden">
                          {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#60a5fa] truncate">{user.firstName} {user.lastName}</div>
                          <div className="text-[#60a5fa] text-xs truncate">{user.email}</div>
                        </div>
                        <Button
                          size="sm"
                          className="border border-green-200 text-green-700 bg-white hover:bg-green-50 hover:text-green-800 font-semibold rounded-full px-4 py-1 shadow-sm"
                          disabled={addingUserId === user.id}
                          onClick={() => handleAddUser(user.id)}
                        >
                          {addingUserId === user.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Ajouter'}
                        </Button>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 rounded-full">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showKickDialog} onOpenChange={() => handleKickDialogClose(false)}>
        <DialogContent className="rounded-2xl shadow-2xl border border-gray-200 bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold">Retirer l'étudiant ?</DialogTitle>
            <DialogDescription className="text-gray-700">Êtes-vous sûr de vouloir retirer cet étudiant de la formation ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-4 justify-end mt-4">
            <Button variant="outline" onClick={() => handleKickDialogClose(false)} className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 rounded-full">Annuler</Button>
            <Button onClick={() => handleKickDialogClose(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full px-6 py-2 shadow">Retirer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 