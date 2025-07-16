import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
   HomeIcon
    
  } from '@heroicons/react/outline';
export default function LoginPage(){
    const navigate=useNavigate()
    const [email,setemail]=useState()
    const [password,setpassword]=useState()
    const [error, setError] = useState('');
    async function handlesubmit(e) {
        e.preventDefault();
        setError('');  
        try {
            const loadingToast = toast.loading('loading...');
            const response = await axios.post('http://localhost:3000/auth/login', {email ,password});
            toast.dismiss(loadingToast);
            console.log('Success:', response.data);
            toast.success('logged in successfully!');
            if(response.data.user.role=="admin"){
              navigate("/AdminDashboard");
            }
            else{
              navigate("/home");
            }
            
          } catch (err) {
            setError(err.response?.data?.message || 'login failed');
          }
        
         
    }
    function handleChangeEmail(e){
        e.preventDefault()
        setemail(e.target.value)
    }
    function handleChangepassword(e){
        e.preventDefault()
        setpassword(e.target.value)
    }
    function navigateHome(){
       window.location="/"
        
    }
    return (<>
     
       <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
       <div className="fixed top-4 right-4 z-50">
            <button
                onClick={navigateHome}
                className="flex items-center justify-center h-10 w-25 bg-red-600 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
                <HomeIcon className="h-5 w-5 " />
            </button>
        </div>
     <section className="min-h-screen flex items-center justify-center p-6">
    <div className="w-full max-w-lg">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:border dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-3xl">
        <div className="p-10 space-y-8">
          
          
          <div className="text-center">
            <div className="mx-auto w-16 h-1 bg-blue-500 dark:bg-blue-600 rounded-full mb-4"></div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Account Login
            </h1>
          </div>

          <form className="space-y-6" onSubmit={handlesubmit}>
            
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => handleChangeEmail(e)}
                  placeholder="name@company.com"
                  className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200"
                  required
                />
              </div>
            </div>

            
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => handleChangepassword(e)}
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200"
                  required
                />
              </div>
            </div>

           
            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-400/20"
            >
              Sign In
            </button>

            
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg">
                <p className="text-red-600 dark:text-red-300 text-lg font-medium">
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  </section>
</div>
    
    </>);
}