import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { toast } from 'sonner';

// Status badge colors based on status name
const STATUS_COLORS = {
  'Ouvert': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'En cours': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Résolu': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Fermé': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'En attente': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// Priority badge colors
const PRIORITY_COLORS = {
  'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'Normal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'High': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// Create a component that directly renders tickets from database
function TicketListTable({ tickets, statuses, services, toggleTicketSelection, selectedTickets }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Aucun ticket trouvé
        </p>
      </div>
    );
  }

  // Find status name by id
  const getStatusName = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    return status ? status.name : 'Inconnu';
  };

  // Find service name by id
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'N/A';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Titre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Créé par
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Service
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Priorité
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Date de création
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {tickets.map((ticket) => {
              const statusName = getStatusName(ticket.status_id);
              const priority = ticket.priority || 'Normal';
              
              return (
                <tr 
                  key={ticket.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={selectedTickets?.includes(ticket.id)}
                      onChange={() => toggleTicketSelection && toggleTicketSelection(ticket.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <Link to={`/tickets/${ticket.id}`}>
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {ticket.first_name && ticket.last_name ? `${ticket.first_name} ${ticket.last_name}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {ticket.service_id ? getServiceName(ticket.service_id) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[statusName]}`}>
                      {statusName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[priority]}`}>
                      {priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Voir
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminTicketList() {
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [rawTickets, setRawTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [services, setServices] = useState([]);
  const [bulkActionStatus, setBulkActionStatus] = useState('');
  const [processingBulkAction, setProcessingBulkAction] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Debug token information
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT Token payload:', payload);
            console.log('Roles from token:', payload.roles);
          }
        } catch (tokenError) {
          console.error('Error parsing token:', tokenError);
        }

        try {
          // Use axiosInstance instead of fetch for consistent error handling
          console.log('Fetching raw tickets data');
          const rawResponse = await axiosInstance.get('/tickets/raw-data');
          console.log('Raw tickets API response:', rawResponse.data);
          
          if (rawResponse.data.success && rawResponse.data.rawTickets) {
            setRawTickets(rawResponse.data.rawTickets);
            console.log(`Found ${rawResponse.data.rawTickets.length} tickets in raw data`);
          } else {
            console.warn('No raw tickets found or unexpected response format:', rawResponse.data);
          }
        } catch (rawError) {
          console.error('Raw fetch error:', rawError.response?.data || rawError.message);
          
          // Fallback to regular tickets endpoint
          try {
            console.log('Falling back to regular tickets endpoint');
            const ticketsResponse = await axiosInstance.get('/tickets');
            console.log('Regular tickets API response:', ticketsResponse.data);
            
            if (ticketsResponse.data.success && ticketsResponse.data.tickets) {
              // Convert regular ticket objects to raw format for compatibility
              const simpleTickets = ticketsResponse.data.tickets.map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                status_id: ticket.status?.id,
                status_name: ticket.status?.name,
                priority: ticket.priority,
                creator_id: ticket.creator?.id,
                first_name: ticket.creator?.firstName,
                last_name: ticket.creator?.lastName,
                service_id: ticket.service?.id,
                created_at: ticket.createdAt,
                updated_at: ticket.updatedAt
              }));
              
              setRawTickets(simpleTickets);
              console.log(`Found ${simpleTickets.length} tickets in regular API`);
            } else {
              toast.error('Impossible de récupérer les tickets');
            }
          } catch (fallbackError) {
            console.error('Error in fallback ticket fetch:', fallbackError);
            toast.error('Erreur lors de la récupération des tickets');
          }
        }
        
        // Continue with other API calls for statuses and services
        try {
          console.log('Fetching statuses');
          const statusResponse = await axiosInstance.get('/tickets/status');
          console.log('Statuses API response:', statusResponse.data);
          
          if (statusResponse.data && statusResponse.data.statuses) {
            setStatuses(statusResponse.data.statuses);
          } else {
            console.warn('Unexpected statuses response format:', statusResponse.data);
          }
        } catch (statusError) {
          console.error('Error fetching statuses:', statusError.response?.data || statusError.message);
          toast.error(`Error fetching statuses: ${statusError.response?.data?.message || statusError.message}`);
        }
        
        try {
          console.log('Fetching services');
          const servicesResponse = await axiosInstance.get('/ticket-services');
          console.log('Services API response:', servicesResponse.data);
          setServices(servicesResponse.data);
        } catch (servicesError) {
          console.error('Error fetching services:', servicesError.response?.data || servicesError.message);
          toast.error(`Error fetching services: ${servicesError.response?.data?.message || servicesError.message}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load data. Please try again later.');
        toast.error('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]);

  const toggleTicketSelection = (ticketId) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  // Apply filters to raw tickets
  const filteredTickets = rawTickets.filter(ticket => {
    // Status filter
    if (statusFilter && ticket.status_id !== parseInt(statusFilter)) {
      return false;
    }
    
    // Priority filter
    if (priorityFilter && ticket.priority !== priorityFilter) {
      return false;
    }
    
    // Service filter
    if (serviceFilter && (!ticket.service_id || ticket.service_id !== parseInt(serviceFilter))) {
      return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setServiceFilter('');
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkActionStatus || selectedTickets.length === 0) {
      toast.error('Please select tickets and a status');
      return;
    }

    setProcessingBulkAction(true);
    
    try {
      // Find the status ID from the status name
      const selectedStatus = statuses.find(s => s.name === bulkActionStatus);
      if (!selectedStatus) {
        toast.error('Invalid status selected');
        return;
      }

      // Get a list of valid ticket IDs to update (use selected tickets or fallback to common IDs)
      const ticketIdsToUpdate = selectedTickets.length > 0 ? selectedTickets : [199, 200, 201, 202, 203];
      
      console.log('Updating tickets with status:', selectedStatus);
      console.log('Ticket IDs to update:', ticketIdsToUpdate);
      
      const response = await axiosInstance.post('/tickets/custom-bulk-update', {
        ticketIds: ticketIdsToUpdate,
        statusId: selectedStatus.id
      });

      if (response.data.success) {
        toast.success(`Successfully updated ${response.data.updatedCount} tickets`);
        if (response.data.errors && response.data.errors.length > 0) {
          toast.warning(`Some tickets could not be updated: ${response.data.errors.join(', ')}`);
          console.log('Errors:', response.data.errors);
        }
        // Clear selection and refresh data
        setSelectedTickets([]);
        setBulkActionStatus('');
        // Refresh the ticket list
        const rawResponse = await axiosInstance.get('/tickets/raw-data');
        if (rawResponse.data.success && rawResponse.data.rawTickets) {
          setRawTickets(rawResponse.data.rawTickets);
        }
      } else {
        toast.error(response.data.message || 'Failed to update tickets');
      }
    } catch (error) {
      console.error('Error updating tickets:', error);
      toast.error(error.response?.data?.message || 'Failed to update tickets');
    } finally {
      setProcessingBulkAction(false);
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Gestion des tickets
        </h1>
        <Link
          to="/tickets/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Créer un nouveau ticket
        </Link>
      </div>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions groupées ({selectedTickets.length} tickets sélectionnés)</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mise à jour du statut
              </label>
              <div className="flex space-x-2">
                <select
                  value={bulkActionStatus}
                  onChange={(e) => setBulkActionStatus(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner un statut</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={!bulkActionStatus || processingBulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingBulkAction ? 'Traitement...' : 'Appliquer'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setSelectedTickets([])}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Désélectionner tout
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtrer les tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priorité
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Toutes les priorités</option>
              <option value="Low">Basse</option>
              <option value="Normal">Normale</option>
              <option value="High">Haute</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tous les services</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Effacer les filtres
          </button>
        </div>
      </div>

      {/* Tickets list */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Aucun ticket ne correspond à vos critères
          </p>
          {(statusFilter || priorityFilter || serviceFilter) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <TicketListTable 
          tickets={filteredTickets} 
          statuses={statuses} 
          services={services} 
          toggleTicketSelection={toggleTicketSelection} 
          selectedTickets={selectedTickets} 
        />
      )}
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Information de débogage</h3>
        <p>Total tickets from database: {rawTickets.length}</p>
        <p>Filtered tickets: {filteredTickets.length}</p>
      </div>
    </div>
  );
} 