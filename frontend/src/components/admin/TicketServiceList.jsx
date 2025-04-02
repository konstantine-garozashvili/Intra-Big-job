import { useState, useEffect } from 'react';
import apiService from '@/lib/services/apiService';
import { toast } from 'sonner';

export default function TicketServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for adding/editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiService.get('/ticket-services');
      setServices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
      toast.error('Erreur lors du chargement des services');
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleEditClick = (service) => {
    setIsEditing(true);
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Le nom du service est requis');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = {
        name: name.trim(),
        description: description.trim() || null
      };
      
      let response;
      
      if (editingId) {
        // Update existing service
        response = await apiService.put(`/ticket-services/${editingId}`, data);
        toast.success('Service mis à jour avec succès');
      } else {
        // Create new service
        response = await apiService.post('/ticket-services', data);
        if (response.data.success) {
          toast.success('Service créé avec succès');
          fetchServices();
        }
      }
      
      // Reset form and refresh services
      setIsEditing(false);
      setEditingId(null);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.message || 'Échec de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return;
    }
    
    try {
      await apiService.delete(`/ticket-services/${id}`);
      toast.success('Service supprimé avec succès');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.message || 'Échec de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des services de support
        </h1>
        
        {!isEditing && (
          <button
            onClick={handleAddNewClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ajouter un service
          </button>
        )}
      </div>
      
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingId ? 'Modifier le service' : 'Ajouter un service'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: Support technique, Facturation, etc."
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Description du service (optionnel)"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Aucun service n'a été ajouté
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {service.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {service.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(service)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 