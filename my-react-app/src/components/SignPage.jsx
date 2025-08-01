import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
export default function SignPage(){
    const navigate=useNavigate()
    const [email,setemail]=useState()
    const [password,setpassword]=useState()
    const [verify,setverify]=useState()
    const [error, setError] = useState('');
    async function handlesubmit(e) {
        e.preventDefault();
        setError('');
        if (password !== verify) {
        setError("Passwords don't match!");
        return;
        }
        
        if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
        }
        
        try {
            const loadingToast = toast.loading('Creating account...');
            const response = await axios.post('http://localhost:3000/auth/signup', {email ,password});
            toast.dismiss(loadingToast);
            console.log('Success:', response.data);
            toast.success('Account created successfully!');
            navigate("/login");
          } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
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
                  Create an account
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
                  <div>
                      <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                      <input type="confirm-password" name="confirm-password" id="confirm-password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={verify} onChange={(e)=>handleChangeverify(e)} required=""/>
                  </div>
                  <div class="flex items-start">
                      <div class="flex items-center h-5">
                        <input id="terms" aria-describedby="terms" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
                      </div>
                      <div class="ml-3 text-sm">
                        <label for="terms" class="font-light text-gray-500 dark:text-gray-300">I accept the <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
                      </div>
                  </div>
                  <button type="submit" class="w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create an account</button>
                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                      Already have an account? <a href="/login" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
                  </p>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
              </form>
          </div>
      </div>
  </div>
</section>
    
    </>);
}