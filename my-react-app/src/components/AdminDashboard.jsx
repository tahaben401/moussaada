import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  ChartBarIcon,
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  XIcon,
  FilterIcon,
  DownloadIcon
} from '@heroicons/react/outline';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
export default function AdminDashboard() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  axios.defaults.withCredentials = true;
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    requestType: '',
    dateFrom: '',
    dateTo: '',
    assignedTo: ''
  });
  const [typestats, settypeStats] = useState({
    logiciel: 0,
    materiel: 0,
    reseau: 0,
    compte: 0
  });
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [assignedType, setAssignedType] = useState('interne'); 
  const [technician, setTechnician] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [price, setPrice] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('open');
  const applyFilters = () => {
    let result = [...tickets];
    
    if (filters.status) {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.priority) {
      result = result.filter(ticket => ticket.priority === filters.priority);
    }
    
    if (filters.requestType) {
      result = result.filter(ticket => ticket.request_type === filters.requestType);
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(ticket => new Date(ticket.created_at) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      result = result.filter(ticket => new Date(ticket.created_at) <= toDate);
    }
    
    if (filters.assignedTo) {
      result = result.filter(ticket => 
        ticket.assigned_to && ticket.assigned_to.toLowerCase().includes(filters.assignedTo.toLowerCase())
      );
    }
    
    setFilteredTickets(result);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      requestType: '',
      dateFrom: '',
      dateTo: '',
      assignedTo: ''
    });
    setFilteredTickets(tickets);
  };
  const exportToExcel = () => {
    const dataToExport = filteredTickets.map(ticket => ({
      'N° Ticket': ticket.ticket_number,
      'Demandeur': ticket.full_name,
      'Email': ticket.email,
      'Département': ticket.departement,
      'Type': ticket.request_type,
      'Priorité': ticket.priority,
      'Statut': ticket.status,
      'Date création': new Date(ticket.created_at).toLocaleDateString(),
      'Assigné à': ticket.assigned_to,
      'Date résolution': ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleDateString() : '',
      'Type résolution': ticket.assignation_type || '',
      'Notes résolution': ticket.resolution_notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, "tickets.xlsx");
  };
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionNotes(ticket.resolution_notes || '');
    setAssignedTo(ticket.assigned_to || '');
    setStatus(ticket.status);
    
    if (ticket.assigned_to_type) {
      setAssignedType(ticket.assigned_to_type);
      if (ticket.assigned_to_type === 'interne') {
        setTechnician(ticket.assigned_to || '');
      } else {
        const assignedData = ticket.assigned_to ? JSON.parse(ticket.assigned_to) : {};
        setCompanyName(assignedData.companyName || '');
        setPrice(assignedData.price || '');
        setContractNumber(assignedData.contractNumber || '');
      }
    } else {
      setAssignedType('interne');
      setTechnician(ticket.assigned_to || '');
    }
  };
  const processTicketData = () => {
    
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
  
    
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const dailyCounts = days.map(day => ({
      day,
      created: 0,
      resolved: 0
    }));
  
   
    tickets.forEach(ticket => {
      const createdDate = new Date(ticket.created_at);
      
      
      if (createdDate >= weekStart) {
        const createdDay = createdDate.getDay(); // 0=Sunday, 1=Monday, etc.
        
        const dayIndex = createdDay === 0 ? 6 : createdDay - 1;
        dailyCounts[dayIndex].created++;
        
        
        if (ticket.status === 'resolved' && ticket.resolved_at) {
          const resolvedDate = new Date(ticket.resolved_at);
          if (resolvedDate >= weekStart) {
            const resolvedDay = resolvedDate.getDay();
            const resolvedDayIndex = resolvedDay === 0 ? 6 : resolvedDay - 1;
            dailyCounts[resolvedDayIndex].resolved++;
          }
        }
      }
    });
  
   
    return {
      labels: dailyCounts.map(d => d.day),
      createdData: dailyCounts.map(d => d.created),
      resolvedData: dailyCounts.map(d => d.resolved)
    };
  };
  const handleLogout = async () => {
      window.location.href = '/login'; 
  };
  const handleUpdateTicket = async () => {
    try {
      let assignedToValue;
      if (assignedType === 'interne') {
        assignedToValue = technician;
      } else {
        // assignedToValue = JSON.stringify({
        //   companyName,
        //   price,
        //   contractNumber
        // });
        assignedToValue=companyName
      }
  
      let updatedTicket = {
        ...selectedTicket,
        assigned_to: assignedToValue,
        assignation_type: assignedType,
        status: status,
        resolution_notes: resolutionNotes,
        ...(status === "resolved" && { resolved_at: new Date().toISOString() }),
        ...(assignedType === "externe" && { expired_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),is_expired: false })
      };
  
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
    const dataToUse = filteredTickets.length > 0 ? filteredTickets : tickets;
    
    setStats({
      total: dataToUse.length,
      open: dataToUse.filter(t => t.status === 'open').length,
      inProgress: dataToUse.filter(t => t.status === 'in_progress').length,
      resolved: dataToUse.filter(t => t.status === 'resolved').length,
      critical: dataToUse.filter(t => t.priority === 'critical').length
    });
    
    settypeStats({
      logiciel: dataToUse.filter(t => t.request_type === 'software').length,
      materiel: dataToUse.filter(t => t.request_type === 'hardware').length,
      reseau: dataToUse.filter(t => t.request_type === 'network').length,
      compte: dataToUse.filter(t => t.request_type === 'account').length
    });
  }, [tickets, filteredTickets]);
  useEffect(() => {
    
    const fetchData = async () => {
      
      const response = await axios.get('http://localhost:3000/tickets',{
        withCredentials: true});
      if(response){
        const ticketsWithExpiration = response.data.map(ticket => {
          if (ticket.assignation_type === 'externe' && ticket.expired_at) {
            const isExpired = new Date(ticket.expired_at) < new Date();
            return { ...ticket, is_expired: isExpired };
          }
          return ticket;
        });
      setTickets(ticketsWithExpiration);
      setStats({
        total: response.data.length,
        open: response.data.filter(t => t.status === 'open').length,
        inProgress: response.data.filter(t => t.status === 'in_progress').length,
        resolved: response.data.filter(t => t.status === 'resolved').length,
        critical: response.data.filter(t => t.priority === 'critical').length
      });
      settypeStats({
        logiciel: response.data.filter(t => t.request_type === 'software').length,
        materiel: response.data.filter(t => t.request_type === 'hardware').length,
        reseau: response.data.filter(t => t.request_type === 'network').length,
        compte: response.data.filter(t => t.request_type === 'account').length
      })
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
    <div className="fixed inset-0 bg-gray-50 overflow-y-auto">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
        <div className="mt-2 h-1 w-full  bg-blue-500 rounded-full "></div>
      </div>
      <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
      >
        <ExclamationIcon className="h-5 w-5 text-red-500" />
        <span className="sr-only sm:not-sr-only text-red-500">Déconnexion</span>
      </button>
  </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
      <StatCard 
        title="Total tickets" 
        value={stats.total} 
        icon={<TicketIcon className="h-6 w-6 text-blue-500" />} 
      
      />
      <StatCard 
        title="Ouverts" 
        value={stats.open} 
        icon={<ExclamationIcon className="h-6 w-6 text-red-500" />} 
      
      />
      <StatCard 
        title="En cours" 
        value={stats.inProgress} 
        icon={<ClockIcon className="h-6 w-6 text-yellow-500" />} 
       
      />
      <StatCard 
        title="Résolus" 
        value={stats.resolved} 
        icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />} 
        
      />
      <StatCard 
        title="Critiques" 
        value={stats.critical} 
        icon={<ExclamationIcon className="h-6 w-6 text-red-500" />} 
        
      />
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3  gap-8 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md col-span-2 border border-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md col-span-2 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
            <div className="flex items-center text-sm text-gray-500">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              <span>7 derniers jours</span>
            </div>
          </div>
          <div className="h-full">
            <Bar 
              data={{
                labels: processTicketData().labels,
                datasets: [
                  {
                    label: 'Tickets créés',
                    data: processTicketData().createdData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                  },
                  {
                    label: 'Tickets résolus',
                    data: processTicketData().resolvedData,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                      stepSize: 1
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                 
          
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type</h2>
        <div className="space-y-4">
          <TypeStat label="Logiciel" value={typestats.logiciel} color="bg-blue-500" />
          <TypeStat label="Matériel" value={typestats.materiel} color="bg-orange-500" />
          <TypeStat label="Réseau" value={typestats.reseau} color="bg-green-500" />
          <TypeStat label="Compte" value={typestats.compte} color="bg-purple-500" />
        </div>
      </div>
    </div>

    {/* Tickets Table */}
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 mt-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tickets {filteredTickets.length !== tickets.length ? `(Filtrés: ${filteredTickets.length})` : ''}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Liste des tickets
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                Filtres
              </button>
              
              <button
                onClick={exportToExcel}
                className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={filteredTickets.length === 0}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous</option>
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous</option>
                    <option value="critical">Critique</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Basse</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de demande</label>
                  <select
                    value={filters.requestType}
                    onChange={(e) => setFilters({...filters, requestType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous</option>
                    <option value="software">Logiciel</option>
                    <option value="hardware">Matériel</option>
                    <option value="network">Réseau</option>
                    <option value="account">Compte</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                  <input
                    type="text"
                    value={filters.assignedTo}
                    onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom du technicien..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Appliquer les filtres
                </button>
              </div>
            </div>
          )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Ticket
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demandeur
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                resolu par
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                date de resolution
              </th>
              <th scope="col" className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                type de resolution
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {(filteredTickets.length > 0 ? filteredTickets : tickets).map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleTicketClick(ticket)}>
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
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.assigned_to}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(ticket.resolved_at)?new Date(ticket.resolved_at).toLocaleDateString():"pas resolu"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(ticket.resolved_at)?ticket.assignation_type:"----"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ticket.assignation_type === 'externe' && ticket.status=='in_progress' && ticket.expired_at && (
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.is_expired 
                        ? 'bg-red-100 text-red-800' 
                        : new Date(ticket.expired_at) < new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.is_expired 
                        ? 'Expiré' 
                        : new Date(ticket.expired_at).toLocaleDateString()}
                    </span>
                  )}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
            <select
              value={assignedType}
              onChange={(e) => setAssignedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="interne">Interne</option>
              <option value="externe">Externe</option>
            </select>
          </div>
          {assignedType === 'interne' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technicien</label>
                <input
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom du technicien..."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom de la société..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Prix..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° Marché</label>
                  <input
                    type="text"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Numéro de marché..."
                  />
                </div>
              </div>
            )}

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


function StatCard({ title, value, icon}) {
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
      
      </div>
  );
}


function TypeStat({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}