import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RequestForm() {
  // Données hiérarchiques pour les sous-catégories
  const requestSubTypes = {
    service: {
      software: ['Installation', 'Mise à jour', 'Configuration', 'Problème d\'utilisation'],
      hardware: ['Nouvel équipement', 'Remplacement', 'Réparation', 'Maintenance'],
      network: ['Configuration réseau', 'Accès VPN', 'WiFi', 'Câblage'],
      account: ['compte SAP', 'compte Windows'],
    },
    incident: {
      software: ['Plantage', 'Erreur système', 'Compatibilité', 'Performance'],
      hardware: ['Défaillance', 'Suréchauffement', 'Panne', 'Problème périphérique'],
      network: ['Connexion perdue', 'Lenteur', 'Sécurité', 'Accès bloqué'],
      account: ['Mot de passe oublié', 'Compte bloqué', 'Accès non autorisé', 'Problème d\'authentification'],
    }
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    requestNature: 'service',
    requestType: 'software',
    requestSubType: '', 
    priority: 'medium',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const shouldResetSubType = (name === 'requestNature' || name === 'requestType');
      return { 
        ...prev, 
        [name]: value,
        ...(shouldResetSubType ? { requestSubType: '' } : {})
      };
    });
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      department: '',
      requestNature: 'service',
      requestType: 'software',
      requestSubType: '', 
      priority: 'medium',
      description: ''
    });
    setTicketNumber(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    if (!formData.requestSubType && formData.requestType !== 'other') {
      setError("Veuillez sélectionner un sous-type.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await axios.post('http://localhost:3000/tickets/create', {
        email: formData.email,
        fullName: formData.fullName,  
        priority: formData.priority,
        description: formData.description,
        department: formData.department, 
        requestType: formData.requestType,
        requestSubType: formData.requestSubType, 
        requestNature: formData.requestNature,
      });
      
      console.log('Success:', response.data);
      setTicketNumber(response.data.ticketNumber);
      
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setError(error.response?.data?.error || "Erreur lors de la soumission. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketNumber) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 text-center">
        <div className="text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Demande soumise avec succès!</h2>
        <p className="text-gray-600 mb-6">Votre ticket a été créé et sera traité par notre équipe.</p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="font-medium">Votre numéro de ticket:</p>
          <p className="text-2xl font-bold text-blue-600">{ticketNumber}</p>
        </div>

        <div className="flex justify-center space-x-4">
          <button 
            onClick={resetForm}
            className="px-6 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nouvelle demande
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen w-full'>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nouvelle demande de support</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Vos informations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nom complet*</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Détails de la demande
            </h3>
          
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="requestNature" className="block text-sm font-medium text-gray-700 mb-1">Nature de demande*</label>
                  <select
                    id="requestNature"
                    name="requestNature"
                    value={formData.requestNature}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                  >
                    <option value="service">Demande de service</option>
                    <option value="incident">Incident</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">Type de demande*</label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                  >
                    <option value="software">Problème logiciel</option>
                    <option value="hardware">Problème matériel</option>
                    <option value="network">Problème réseau</option>
                    <option value="account">Compte utilisateur</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              {formData.requestType && formData.requestType !== 'other' && (
                <div>
                  <label htmlFor="requestSubType" className="block text-sm font-medium text-gray-700 mb-1">Sous-type*</label>
                  <select
                    id="requestSubType"
                    name="requestSubType"
                    value={formData.requestSubType}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required={formData.requestType !== 'other'}
                  >
                    <option value="">-- Sélectionnez un sous-type --</option>
                    {requestSubTypes[formData.requestNature]?.[formData.requestType]?.map((subType) => (
                      <option key={subType} value={subType}>
                        {subType}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priorité*</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  required
                >
                  <option value="medium">Moyenne</option>
                  <option value="critical">Critique</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description détaillée*</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Décrivez votre problème en détail, y compris les étapes pour le reproduire si possible..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 text-black rounded-lg transition-colors ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}