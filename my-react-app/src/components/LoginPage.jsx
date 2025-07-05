import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
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
            navigate("/AdminDashboard");
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
    function handleChangeverify(e){
        e.preventDefault()
        setverify(e.target.value)
    }
    return (<>
       <section class=" dark:bg-gray-900">
  <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Login Form
              </h1>
              <form class="space-y-4 md:space-y-6" onSubmit={handlesubmit} >
                  <div>
                      <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                      <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={email} onChange={(e)=>handleChangeEmail(e)} placeholder="name@company.com" required=""/>
                  </div>
                  <div>
                      <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={password} onChange={(e)=>handleChangepassword(e)} required=""/>
                  </div>
                  
                  <button type="submit" class="w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Login</button>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
              </form>
          </div>
      </div>
  </div>
</section>
    
    </>);
}