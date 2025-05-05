import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Users, Calendar, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import apiService from '@/lib/services/apiService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
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
    fetchFormation();
  }, [id]);

  useEffect(() => {
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
    fetchAcceptedStudents();
  }, [id]);

  const handleKickStudent = async (studentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet étudiant de la formation ?')) return;
    try {
      await apiService.delete(`/api/formations/${id}/students/${studentId}`);
      toast.success('Étudiant retiré de la formation.');
      setAcceptedStudents((prev) => prev.filter((s) => s.id !== studentId));
      setAcceptedCount((prev) => prev - 1);
      setStudentCount((prev) => prev - 1);
    } catch (err) {
      toast.error('Erreur lors du retrait de l\'étudiant.');
    }
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
      setAvailableUsers(users);
    } catch (err) {
      setAvailableUsers([]);
      toast.error("Erreur lors du chargement des utilisateurs disponibles.");
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAddUser = async (userId) => {
    setAddingUserId(userId);
    try {
      await apiService.post(`/api/formations/${id}/students/${userId}`);
      toast.success('Utilisateur ajouté à la formation.');
      setShowAddModal(false);
      // Refresh accepted students list
      const res = await apiService.get(`/api/formations/${id}/enrollment-requests?status=accepted`);
      let students = [];
      if (res && res.success && Array.isArray(res.data)) {
        students = res.data.map(r => r.user);
      } else if (Array.isArray(res)) {
        students = res.map(r => r.user);
      }
      setAcceptedStudents(students);
      setAcceptedCount(students.length);
      // Re-fetch formation to update studentCount and enrolledStudents
      await fetchFormation();
    } catch (err) {
      toast.error("Erreur lors de l'ajout de l'utilisateur.");
    } finally {
      setAddingUserId(null);
    }
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
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <img
                src={formation.image_url || '/placeholder.svg'}
                alt={formation.name}
                className="w-48 h-32 object-cover rounded-lg border"
              />
              <div className="font-bold text-2xl mb-1">{formation.name}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{formation.specialization?.name || 'Formation'}</Badge>
                <Badge variant="outline">{formation.promotion || 'N/A'}</Badge>
              </div>
              <div className="text-gray-700 mb-2 text-center">{formation.description}</div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-300 mb-2 w-full max-w-md">
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formation.dateStart ? new Date(formation.dateStart).toLocaleDateString() : 'N/A'}</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{formation.duration ? `${formation.duration} mois` : 'N/A'}</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" />Capacité: {formation.capacity || 'N/A'}</div>
                {formation.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{formation.location}</div>}
              </div>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Users className="w-5 h-5" />
                  <span>{studentCount} étudiants inscrits</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <Users className="w-5 h-5" />
                  <span>{acceptedCount} demandes acceptées</span>
                </div>
              </div>
              <div className="w-full mt-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-left">Étudiants acceptés</h3>
                  <Button onClick={handleOpenAddModal} className="bg-blue-600 hover:bg-blue-700 text-white">Ajouter</Button>
                </div>
                {acceptedStudents.length === 0 ? (
                  <div className="text-gray-500 text-sm">Aucun étudiant accepté pour cette formation.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {acceptedStudents.map((student) => (
                      <li key={student.id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                        <span className="text-gray-500 text-sm">{student.email}</span>
                        <button
                          className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          onClick={() => handleKickStudent(student.id)}
                        >
                          Retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Show directly enrolled students not in acceptedStudents */}
                {enrolledStudents.filter(s => !acceptedStudents.some(a => a.id === s.id)).length > 0 && (
                  <>
                    <h4 className="mt-6 mb-2 text-md font-semibold text-left">Étudiants inscrits</h4>
                    <ul className="divide-y divide-gray-200">
                      {enrolledStudents.filter(s => !acceptedStudents.some(a => a.id === s.id)).map((student) => (
                        <li key={student.id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="font-medium">{student.firstName} {student.lastName}</span>
                          <span className="text-gray-500 text-sm">{student.email}</span>
                          <button
                            className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            onClick={() => handleKickStudent(student.id)}
                          >
                            Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur à la formation</DialogTitle>
            <DialogDescription>Choisissez un invité ou étudiant à ajouter à cette formation.</DialogDescription>
          </DialogHeader>
          {loadingAvailable ? (
            <div className="py-6 text-center"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></div>
          ) : availableUsers.length === 0 ? (
            <div className="py-6 text-center text-gray-500">Aucun utilisateur disponible à ajouter.</div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {availableUsers.map(user => (
                <li key={user.id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <span className="text-gray-500 text-sm">{user.email}</span>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={addingUserId === user.id}
                    onClick={() => handleAddUser(user.id)}
                  >
                    {addingUserId === user.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Ajouter'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 