import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import LoginPage from './components/LoginPage.jsx';
import SignPage from './components/SignPage.jsx';
import HomePage from './components/HomePage.jsx';
import RequestForm from './components/RequestForm.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function App() {
  return (
    <>
    <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignPage />} />
        <Route path="/request" element={<RequestForm/>} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;