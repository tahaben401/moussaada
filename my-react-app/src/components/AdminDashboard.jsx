import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ChartBarIcon,
  TicketIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
  XIcon
} from '@heroicons/react/outline';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('open');
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionNotes(ticket.resolution_notes || '');
    setAssignedTo(ticket.assigned_to || '');
    setStatus(ticket.status);
  };
  const handleUpdateTicket = async () => {
    try {
      let updatedTicket;
      
      if (status === "resolved") {
        updatedTicket = {
          ...selectedTicket,
          assigned_to: assignedTo,
          status: status,
          resolution_notes: resolutionNotes,
          resolved_at: new Date().toISOString() 
        };
      } else {
        updatedTicket = {
          ...selectedTicket,
          assigned_to: assignedTo,
          status: status,
          resolution_notes: resolutionNotes
        };
      }
  
      await axios.post(`http://localhost:3000/tickets/update/${selectedTicket.id}`, updatedTicket);
     
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? updatedTicket : t
      ));
      setSelectedTicket(null);
      
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };
  useEffect(() => {
    
    const fetchData = async () => {
      
      const response = await axios.get('http://localhost:3000/tickets',{
        withCredentials: true});
      if(response){
      setTickets(response.data);
      setStats({
        total: response.data.length,
        open: response.data.filter(t => t.status === 'open').length,
        inProgress: response.data.filter(t => t.status === 'in_progress').length,
        resolved: response.data.filter(t => t.status === 'resolved').length,
        critical: response.data.filter(t => t.priority === 'critical').length
      });
    }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord administrateur</h1>
        
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatCard 
            title="Total tickets" 
            value={stats.total} 
            icon={<TicketIcon className="h-6 w-6 text-blue-500" />} 
            trend="up"
            trendValue="12%"
          />
          <StatCard 
            title="Ouverts" 
            value={stats.open} 
            icon={<ExclamationIcon className="h-6 w-6 text-red-500" />} 
            trend="up"
            trendValue="5%"
          />
          <StatCard 
            title="En cours" 
            value={stats.inProgress} 
            icon={<ClockIcon className="h-6 w-6 text-yellow-500" />} 
            trend="down"
            trendValue="3%"
          />
          <StatCard 
            title="Résolus" 
            value={stats.resolved} 
            icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />} 
            trend="up"
            trendValue="8%"
          />
          <StatCard 
            title="Critiques" 
            value={stats.critical} 
            icon={<ExclamationIcon className="h-6 w-6 text-red-500" />} 
            trend="up"
            trendValue="15%"
          />
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
          <div className="bg-white p-6 rounded-lg shadow col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Activité récente</h2>
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">7 derniers jours</span>
              </div>
            </div>
            <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Graphique des tickets par jour</p>
            </div>
          </div>

         
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Répartition par type</h2>
            <div className="space-y-4">
              <TypeStat label="Logiciel" value={45} color="bg-blue-500" />
              <TypeStat label="Matériel" value={30} color="bg-orange-500" />
              <TypeStat label="Réseau" value={15} color="bg-green-500" />
              <TypeStat label="Compte" value={10} color="bg-purple-500" />
            </div>
          </div>
        </div>

        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tickets récents
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Liste des 10 derniers tickets créés
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Ticket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demandeur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50" onClick={() => handleTicketClick(ticket)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.request_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selectedTicket && (
  <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="sticky top-0 bg-white p-6 pb-4 border-b flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ticket #{selectedTicket.ticket_number}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Created: {new Date(selectedTicket.created_at).toLocaleDateString()}
          </p>
        </div>
        <button 
          onClick={() => setSelectedTicket(null)}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Modal Body */}
      <div className="p-6 space-y-6">
        {/* Ticket Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Requester Info</h3>
            <p className="text-gray-700"><span className="font-medium">Name:</span> {selectedTicket.full_name}</p>
            <p className="text-gray-700"><span className="font-medium">Email:</span> {selectedTicket.email}</p>
            <p className="text-gray-700"><span className="font-medium">Department:</span> {selectedTicket.departement}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ticket Details</h3>
            <p className="text-gray-700"><span className="font-medium">Type:</span> {selectedTicket.request_type}</p>
            <p className="text-gray-700"><span className="font-medium">Priority:</span> 
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                {selectedTicket.priority}
              </span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{selectedTicket.description}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Assign to technician..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter resolution details..."
            />
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end space-x-3">
        <button 
          onClick={() => setSelectedTicket(null)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button 
          onClick={handleUpdateTicket}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
}


function StatCard({ title, value, icon, trend, trendValue }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className={`inline-flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? (
              <ArrowSmUpIcon className="h-4 w-4" />
            ) : (
              <ArrowSmDownIcon className="h-4 w-4" />
            )}
            <span className="ml-1">{trendValue}</span>
            <span className="ml-1">vs hier</span>
          </span>
        </div>
      </div>
    </div>
  );
}


function TypeStat({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}