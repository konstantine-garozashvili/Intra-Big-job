import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [services, setServices] = useState([]);

  // Check if user has admin role
  useEffect(() => {
    const checkAdminRole = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return;
        
        const payload = JSON.parse(atob(tokenParts[1]));
        const userIsAdmin = payload.roles && 
          (payload.roles.includes('ROLE_ADMIN') || 
           payload.roles.includes('ROLE_SUPERADMIN'));
           
        setIsAdmin(userIsAdmin);
        
        // Redirect admin users to the admin tickets page
        if (userIsAdmin) {
          window.location.href = '/admin/tickets';
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };
    
    checkAdminRole();
  }, []);

  // Fetch statuses for filtering
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('/api/tickets/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.statuses) {
          setStatuses(response.data.statuses);
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };
    
    fetchStatuses();
  }, []);

  // Fetch services for filtering
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('/api/ticket-services', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    
    fetchServices();
  }, []);
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('/api/tickets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setTickets(response.data.tickets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Failed to load tickets. Please try again later.');
        toast.error('Failed to load tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Apply filters to tickets
  const filteredTickets = tickets.filter(ticket => {
    // Status filter
    if (statusFilter && ticket.status.name !== statusFilter) {
      return false;
    }
    
    // Priority filter
    if (priorityFilter && ticket.priority !== priorityFilter) {
      return false;
    }
    
    // Service filter
    if (serviceFilter && (!ticket.service || ticket.service.id !== parseInt(serviceFilter))) {
      return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setServiceFilter('');
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
          Vos tickets
        </h1>
        <Link
          to="/tickets/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Créer un nouveau ticket
        </Link>
      </div>

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
                <option key={status.id} value={status.name}>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Titre
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Créé par
                    </th>
                  )}
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
                    Dernière mise à jour
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => window.location.href = `/tickets/${ticket.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Link to={`/tickets/${ticket.id}`}>
                        {ticket.title}
                      </Link>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ticket.creator ? `${ticket.creator.firstName} ${ticket.creator.lastName}` : 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {ticket.service ? ticket.service.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[ticket.status.name]}`}>
                        {ticket.status.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[ticket.priority || 'Normal']}`}>
                        {ticket.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 