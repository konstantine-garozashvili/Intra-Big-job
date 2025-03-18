import React, { useState, useEffect } from 'react';
import { formationService } from '../lib/services/formationService';
import { toast } from 'react-toastify';

const FormationList = () => {
  const [formations, setFormations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const response = await formationService.getAllFormations();
      if (response.success === false) {
        toast.error(response.message || 'Erreur lors du chargement des formations');
        return;
      }
      setFormations(response);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      toast.error('Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
    }
  };

  const showAddStudentModal = async (formation) => {
    setSelectedFormation(formation);
    try {
      const response = await formationService.getAvailableStudents(formation.id);
      if (response.success === false) {
        toast.error(response.message || 'Erreur lors du chargement des étudiants disponibles');
        return;
      }
      setAvailableStudents(response);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants disponibles:', error);
      toast.error('Erreur lors du chargement des étudiants disponibles');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFormation(null);
    setSelectedStudentId('');
    setAvailableStudents([]);
  };

  const addStudent = async () => {
    if (!selectedStudentId || !selectedFormation) {
      toast.error('Veuillez sélectionner un étudiant');
      return;
    }

    try {
      const response = await formationService.addStudentToFormation(
        selectedFormation.id,
        selectedStudentId
      );
      
      if (response.success === false) {
        toast.error(response.message || 'Erreur lors de l\'ajout de l\'étudiant');
        return;
      }

      toast.success('Étudiant ajouté avec succès');
      
      // Rafraîchir la liste des formations
      await loadFormations();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
      toast.error('Erreur lors de l\'ajout de l\'étudiant');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Liste des Formations</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formations.map(formation => (
          <div key={formation.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{formation.name}</h3>
              <p className="text-gray-600 mb-2">Promotion: {formation.promotion}</p>
              <p className="text-gray-600 mb-4">{formation.description}</p>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Étudiants inscrits:</h4>
                {formation.students.length > 0 ? (
                  <ul className="space-y-1">
                    {formation.students.map(student => (
                      <li key={student.id} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {student.firstName} {student.lastName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Aucun étudiant inscrit</p>
                )}
              </div>

              <button
                onClick={() => showAddStudentModal(formation)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter un étudiant
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout d'étudiant */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Ajouter un étudiant à {selectedFormation?.name}
              </h3>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Sélectionner un étudiant:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choisir un étudiant</option>
                  {availableStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={addStudent}
                  disabled={!selectedStudentId}
                  className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${
                    selectedStudentId
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormationList;
