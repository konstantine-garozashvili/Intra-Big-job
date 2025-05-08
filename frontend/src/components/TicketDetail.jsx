import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { toast } from 'sonner';

// Status badge colors based on status name
const STATUS_COLORS = {
  'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'Pending': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// Priority badge colors
const PRIORITY_COLORS = {
  'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'Normal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'High': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('Normal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return;
        
        const payload = JSON.parse(atob(tokenParts[1]));
        
        const userIsAdmin = payload.roles && 
          (payload.roles.includes('ROLE_ADMIN') || 
           payload.roles.includes('ROLE_SUPER_ADMIN') ||
           payload.roles.includes('ROLE_SUPERADMIN'));
           
        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };

    checkUserRole();
    fetchTicketData();
    
    // Try to load statuses separately
    const fetchStatuses = async () => {
      try {
        const statusResponse = await axiosInstance.get('/tickets/status');
        
        if (statusResponse.data && statusResponse.data.statuses) {
          setStatuses(statusResponse.data.statuses);
        }
      } catch (statusError) {
        console.error('Error fetching statuses:', statusError);
      }
    };
    
    fetchStatuses();
  }, [id]); // Re-run when ticket ID changes

  const handleStatusChange = async () => {
    if (!isAdmin || !selectedStatus || selectedStatus === ticket.status.id) {
      return;
    }
    
    setUpdating(true);
    
    try {
      const response = await axiosInstance.put(`/tickets/${id}`, {
        statusId: selectedStatus
      });
      
      setTicket(response.data.ticket);
      toast.success('Ticket status updated successfully');
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleTicketUpdate = async () => {
    if (!isAdmin || (selectedStatus === ticket.status.id && selectedPriority === ticket.priority)) {
      return;
    }
    
    setUpdating(true);
    
    try {
      const response = await axiosInstance.put(`/tickets/${id}`, {
        statusId: selectedStatus,
        priority: selectedPriority
      });
      
      // Find the selected status object to update the ticket properly
      const updatedStatus = statuses.find(status => status.id === selectedStatus);
      
      // Create a proper updated ticket state
      const updatedTicket = {
        ...ticket,
        status: updatedStatus || ticket.status,
        priority: selectedPriority,
        updatedAt: new Date().toISOString()
      };
      
      setTicket(updatedTicket);
      toast.success('Ticket mis à jour avec succès');
      
      // Optionally refresh the data from the server to ensure we have the latest state
      fetchTicketData();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error(error.response?.data?.message || 'Échec de la mise à jour du ticket');
    } finally {
      setUpdating(false);
    }
  };

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch ticket details using axiosInstance which handles baseURL and authentication
        const response = await axiosInstance.get(`/tickets/${id}`);
        
        if (response.data && response.data.ticket) {
          setTicket(response.data.ticket);
          setSelectedStatus(response.data.ticket.status?.id || '');
          setSelectedPriority(response.data.ticket.priority || 'Normal');
          setLoading(false);
        } else {
          throw new Error('Invalid ticket data received');
        }
      } catch (error) {
        // Try to fetch from /tickets endpoint if there's a 403
        if (error.response?.status === 403) {
          try {
            // Fetch all tickets (which we know works for admin ticket list)
            const allTicketsResponse = await axiosInstance.get('/tickets');
            
            if (allTicketsResponse.data?.tickets?.length > 0) {
              // Find the ticket with the matching ID
              const matchingTicket = allTicketsResponse.data.tickets.find(
                ticket => ticket.id === parseInt(id)
              );
              
              if (matchingTicket) {
                setTicket(matchingTicket);
                setSelectedStatus(matchingTicket.status?.id || '');
                setSelectedPriority(matchingTicket.priority || 'Normal');
                setLoading(false);
                return;
              }
            }
            
            // If we get here, we didn't find the ticket
            setError("Vous n'avez pas accès à ce ticket.");
            setLoading(false);
          } catch (fallbackError) {
            setError("Vous n'avez pas accès à ce ticket.");
            setLoading(false);
          }
        } else {
          setError(error.response?.data?.message || 'Failed to load ticket details');
          setLoading(false);
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to load ticket details');
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setAddingComment(true);
    
    try {
      const response = await axiosInstance.post(`/tickets/${id}/comments`, {
        content: newComment.trim(),
        isFromAdmin: isAdmin
      });
      
      // Update the local state with the new comment
      setTicket(prevTicket => ({
        ...prevTicket,
        comments: [...(prevTicket.comments || []), response.data.comment]
      }));
      
      setNewComment('');
      toast.success('Commentaire ajouté avec succès');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Échec de l\'ajout du commentaire');
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-4">{error || 'Ticket not found'}</p>
        <button 
          onClick={() => navigate(isAdmin ? '/admin/tickets' : '/tickets')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retour aux tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate(isAdmin ? '/admin/tickets' : '/tickets')}
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux tickets
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
              Ticket #{ticket.id}: {ticket.title}
            </h1>
            
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[ticket.status.name]}`}>
                {ticket.status.name}
              </span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
                {ticket.priority || 'Normal'}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Créé par</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {ticket.creator.firstName} {ticket.creator.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Créé le</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              {ticket.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assigné à</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                  </p>
                </div>
              )}
              {ticket.updatedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {ticket.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Résolu le</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(ticket.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
            
            {ticket.service && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Service concerné</h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <p className="text-gray-900 dark:text-white">
                    {ticket.service.name}
                    {ticket.service.description && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">- {ticket.service.description}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
            
            {/* Ticket Comments/Responses Section */}
            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Communications</h2>
              
              {/* Display existing comments */}
              <div className="space-y-4 mb-6">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-lg ${
                        comment.isFromAdmin 
                          ? 'bg-blue-50 dark:bg-blue-900/30 ml-8' 
                          : 'bg-gray-50 dark:bg-gray-700 mr-8'
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <p className="font-medium text-sm">
                          {comment.isFromAdmin ? 'Support' : ticket.creator.firstName + ' ' + ticket.creator.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Aucune communication pour le moment
                  </div>
                )}
              </div>
              
              {/* Add new comment form */}
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  {isAdmin ? 'Répondre au ticket' : 'Ajouter un commentaire'}
                </h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={isAdmin ? "Votre réponse au ticket..." : "Ajoutez des informations complémentaires..."}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingComment ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions administrateur</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mise à jour du statut
                    </label>
                    <select
                      id="status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mise à jour de la priorité
                    </label>
                    <select
                      id="priority"
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleTicketUpdate}
                    disabled={updating || (selectedStatus === ticket.status.id && selectedPriority === ticket.priority)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Mise à jour...' : 'Mettre à jour le ticket'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 