import { useNavigate,Link } from "react-router-dom";
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
      
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
           <span className="text-blue-600">Moussaada</span> 
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Système de gestion des demandes techniques
        </p>
      </header>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      
        <Link 
          to="/login" 
          className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
        >
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7l6-3m-6 3l-6-3m6 3v10l6 3m-6-3l-6 3m6-3v10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Espace Administrateur</h2>
            <p className="text-gray-600 mb-4">Accès au tableau de bord de gestion des demandes</p>
            
          </div>
        </Link>

        
        <Link 
          to="/request" 
          className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
        >
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nouvelle Demande</h2>
            <p className="text-gray-600 mb-4">Soumettre une demande d'assistance technique</p>
           
          </div>
        </Link>
      </div>

     
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Service IT &copy; {new Date().getFullYear()} - Tous droits réservés</p>
      </footer>
    </div>
  );
}